---
title: "Clean Architecture: Migrations"
date: 2021-05-09
categories: programming, algorithms
keywords:
---
Recently I have been working on an intensive network migration project for a Dutch enterprise. This is by far one of the most exciting and yet fearsome projects I have been involved in. The migration project involves rebuilding the clients network based on standardized and automated profiles. This brings significant benefits to the service provider as well as the client. Such benefits are for example:

- Devices will run based on a standardized and harmonious configuration throughout the entire network, thus it is always possible to deduct what configuration a certain device is running. This helps tremendously for operations and troubleshooting
- Standardized profiles allows standardized and controlled changes across the network
- Configuration management becomes easier and faster

When migrating a network, we have to introduce a momentarily outage. Now, imagine telling a multi billion euro enterprise running heavily on its network that for the migration we need to cut out your networks for a few minutes!

The only way to do such thing, is to convince them of a rock solid procedure that includes well defined steps, it is secure, has an easy roll back scenario and most of all very well tested.

During this project one of the interesting problems we needed to solve was validating the client's legacy network. The clients network information is stored in a CMDB. But, over time CMDBs always go out of sync with reality. So, how can we use the information in the CMDB for migrating the networks? The answer is, we have to validate and use only the parts we are certain of. Otherwise chances of success will drop significantly.

The code for this post can be found at [https://github.com/pmesgari/the_verdict](https://github.com/pmesgari/the_verdict)

---

## The Migration Verdict

To migrate the client's network we needed to validate a few parameters such as the current network id, name, branch id and device serial number. These parameters are required in our automation pipeline to migrate a network to a new state.

On one side we have our CMDB, on the other we have the network manager which in this case is Meraki Dashboard.

Whether a network is eligible for migration depends on validity of the parameters above. To reach such conclusion I use the term migration verdict. A verdict specifies a go/no go state for a given network in the CMDB. Thus, our use case is pretty simple to define:

|   |
|---|
|**Our Use Case:** Given a CMDB network reach a migration verdict|

When building new applications I start with imagining how the software will be used, whether the user is a human being, another system or library doesn't really matter. For the purposes of this application, I assumed the user will run the program through a CLI. So, how would the interactions with the CLI look like?

The CLI would allow the user to specify input, configuration parameters and output specifications. This allows flexibility in the interactions. There are two main modes of running the CLI, a **single run** or a **CSV run**. The CSV run is helpful to validate a large number of networks at once.

## The Model

The model is simple and captures the main concepts of the domain. After all this application is used by network operators teams and the terms and concepts must be familiar to them. For example a go/no go term is used on a daily basis by operations and using such terms in our code and model allows everyone to understand the expected behavior and outcome of the application.

To further help with later parsing of the verdicts I am using a simple `Enum` structure to represent a migration color. This is nothing more than a simple statement, but it is helpful for end user and allows them to later filter out the results.

```python
from enum import Enum


class MigrationColor(Enum):
    GREEN = 'Go for migration'
    RED = 'No go for migration'


class Verdict:
    def __init__(self, network: dict, color: MigrationColor):
        self.network = network
        self.color = color
        self.errors = []

    @property
    def has_error(self):
        return len(self.errors) > 0

    @property
    def message(self):
        msg = "\n".join([f"{err.get('parameter')}: {err.get('message')}"
                         for err in self.errors])
        return msg

    @classmethod
    def go(cls, network: dict):
        return Verdict(network=network, color=MigrationColor.GREEN)

    @classmethod
    def no_go(cls, network: dict):
        return Verdict(network=network, color=MigrationColor.RED)

    def add_error(self, parameter: str, message: str):
        self.errors.append({'parameter': parameter, 'message': message})

    def to_json(self):
        return {
            'network_id': self.network.get('network_id'),
            'name': self.network.get('name'),
            'serial': self.network.get('serial'),
            'branch_id': self.network.get('branch_id'),
            'verdict': self.color.value,
            'errors': self.message
        }
```

Our model is simply one class called `Verdict`. It has a few helper methods for creating and retrieving information from verdict objects. Let's see how our model is used.

## The Use Case

Use case is the most interesting part of the application. It is here that orchestration of business logic happens. It consists of three simple steps. These steps form the core of our application, in other words this is all we care about. Everything else comes second.

1. Read the Meraki network
2. Compare the result to the given network
3. Make a migration verdict

> We care about the core of our application logic, everything else comes second. Database, UI, infrastructure etc...

So, how does our use case looks like?

```python
import meraki
from models import Verdict


def read_meraki_network(network_id: str, serial: str, client: meraki.DashboardAPI):
    try:
        network = client.networks.getNetwork(networkId=network_id)
        device = client.devices.getDevice(serial)
        return {
            'network_id': network.get('networkId'),
            'name': network.get('name'),
            'serial': device.get('serial')
        }
    except meraki.APIError:
        return None


def make_migration_verdict_for(legacy_network: dict, meraki_network: dict):
    no_go_verdict = Verdict.no_go(legacy_network)
    if meraki_network is None:
        no_go_verdict.add_error('network_id', 'does not exist in Meraki Dashboard')
        return no_go_verdict

    if legacy_network.get('name') != meraki_network.get('name'):
        no_go_verdict.add_error('network_name', 'does not match')
    if legacy_network.get('serial') != meraki_network.get('serial'):
        no_go_verdict.add_error('serial', 'does not match')

    if no_go_verdict.has_error:
        return no_go_verdict
    return Verdict.go(legacy_network)


class ValidateLegacyNetworkUseCase:
    def __init__(self, client: meraki.DashboardAPI):
        self.client = client

    def execute(self, args):
        network_id = args.get('network_id')
        serial = args.get('serial')
        name = args.get('name')
        branch_id = args.get('branch_id')
        legacy_network = {
            'network_id': network_id,
            'serial': serial,
            'name': name,
            'branch_id': branch_id
        }
        meraki_network = read_meraki_network(network_id, serial, self.client)
        verdict = make_migration_verdict_for(legacy_network, meraki_network)
        return verdict

```

We have a class modeling our use case called `ValidateLegacyNetworkUseCase`. We have chosen names that reflect our intent as well as domain. Our class defines an `execute` method that can be invoked to run the use case. We start with getting the parameters we need from the incoming arguments and then create a simple dictionary representing the legacy network. Then, we request reading a Meraki network using the parameters of the legacy network. Finally, we call our helper method `make_migration_verdict_for` by passing the two networks to make us a migration verdict.

Important points to note here:

- Our `execute` method encapsulates the business logic of our application.
- Our `read_meraki_network` method encapsulates the details of making and receiving API calls from the Meraki Dashboard API.
- Our `make_migration_verdict_for` encapsulates the details of comparing the two networks and eventually creating a verdict.

Encapsulating each of these methods allows our application to grow without spilling changes everywhere. We have gathered the logic into clusters such that each cluster has a single reason to change. For example, if Meraki API changes our use case is not bothered because we only call the `read_meraki_network` method and don't care about what happens inside as long as we get back a result to process further.

The same applies to the `make_migration_verdict_for` method. Here we are clustering all the logic needed to compare two networks. Now we are checking based on network id, name and serial but what happens if we need to check based on tags or network type parameters. Again our core logic doesn't bother because we have protected it from such changes.

## The Repository

This is a simple class that we later use in our CLI so that we don't have to deal with reading networks and CSV files directly.

```python
import csv
from pathlib import Path


class CsvRepository:
    def __init__(self, folder):
        self._networks_path = Path(folder) / 'networks.csv'

    def list_networks(self):
        networks = []
        with open(self._networks_path) as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                networks.append(row)
        return networks
```

## The Presenters

As noted above everything else comes second to our business logic. The way we present the results to the outside world is a perfect example of secondary priorities. In what format and location we return or store results changes over time and honestly has nothing to do with our core logic. Thus, we want to protect our application logic from output stuff. Here comes the `Presenter`. A presenter is a simple class that prepares the data for the desired output format. The most interesting methods are `present` and `end`.

We make use of the `present` method when running our use cases. It handles formatting the data to our desired shape. When we are done with our use case we simple call the `end` method. This performs the final act of the presentation, whether displaying the result to the standard output or saving to a file.

```python
import json
import csv
from pathlib import Path


class JsonPresenter:
    def __init__(self, pretty=True):
        self._formatted_data = []
        self.pretty = pretty

    def present(self, data):
        if self.pretty:
            self._formatted_data = json.dumps([verdict.to_json() for verdict in [data]], indent=4)
        else:
            self._formatted_data = json.dumps([verdict.to_json() for verdict in [data]])

    def end(self):
        print(self._formatted_data)

    def get_presented_data(self):
        return self._formatted_data


class CsvPresenter:
    def __init__(self, folder):
        self._output_path = Path(folder) / "output.csv"
        self._formatted_data = []

    def present(self, data):
        self._formatted_data.append(data.to_json())

    def end(self):
        fieldnames = ['network_id', 'name', 'serial', 'branch_id', 'verdict', 'errors']
        with open(self._output_path, 'w', newline='\n') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for data in self._formatted_data:
                writer.writerow(data)

    def get_presented_data(self):
        return self._formatted_data

```

## The CLI

The final bang, putting everything together. This is the highest level of our application. It is here that we glue everything together. The magic happens in the `run_cli` method. After we receive the CLI arguments we use our custom parse method to transform the arguments into a format understandable by our use case and CLI application.

We first perform some sanity checks, for example we allow either a single or CSV run, a user can not run both at the same time. We make sure all the minimum parameters are there and decide on the output format. With all these done it is time to invoke our use case and finally present the data.

```python
def run_cli(args):
    use_case_args = parse_args(vars(args))

    config = use_case_args.get('config', {})
    data = use_case_args.get('data')
    csv = use_case_args.get('csv', None)
    output_format = use_case_args.get('output', 'json')
    output_folder = use_case_args.get('output_folder', 'data')

    # validate at least csv or data are used
    if not csv and not data:
        raise ValueError('at least csv or data parameter are needed')

    # validate csv and data are not used at the same time
    if csv and data:
        raise ValueError('csv and data parameters can not be used at the same time')

    # validate configuration parameters
    output_log = config.get('OUTPUT_LOG', False)
    api_key = config.get('API_KEY', None)
    if api_key is None:
        raise ValueError('configuration parameter API_KEY is missing')

    client = meraki.DashboardAPI(api_key=api_key, output_log=output_log)

    # decide on the output format
    presenter = JsonPresenter()
    if output_format == 'csv':
        presenter = CsvPresenter(output_folder)

    # determine single or csv run
    if csv:
        repo = CsvRepository(folder=csv)
        run_csv(client=client, repo=repo, presenter=presenter)
    else:
        # validate data parameters
        minimum_data_parameters = {'network_id', 'name', 'serial', 'branch_id'}
        if not minimum_data_parameters.issubset(set(data.keys())):
            raise ValueError('Minimum data parameters are missing, see usage')

        run_validate_legacy_network_use_case(data=data, client=client, presenter=presenter)

    presenter.end()
```