# askew
A little web app that exposes a simple interface to return Azure AD product/SKU friendly names in JSON

### Sample Usage

* GET /products

```
[
    {
        "productName": "APP CONNECT IW",
        "stringID": "SPZA_IW",
        "guid": "8f0c5670-4e56-4892-b06d-91c085d7004f",
        "servicePlansIncluded": [
            "SPZA (0bfc98ed-1dbc-4a97-b246-701754e48b17)",
            "EXCHANGE_S_FOUNDATION (113feb6c-3fe4-4440-bddc-54d774bf0318)"
        ],
        "servicePlansIncludedFriendlyNames": [
            "APP CONNECT (0bfc98ed-1dbc-4a97-b246-701754e48b17)",
            "EXCHANGE FOUNDATION (113feb6c-3fe4-4440-bddc-54d774bf0318)"
        ]
    },
    {
        "productName": "AUDIO CONFERENCING",
        "stringID": "MCOMEETADV",
        "guid": "0c266dff-15dd-4b49-8397-2bb16070ed52",
        "servicePlansIncluded": "MCOMEETADV (3e26ee1f-8a5f-4d52-aee2-b81ce45c8f40)",
        "servicePlansIncludedFriendlyNames": "AUDIO CONFERENCING (3e26ee1f-8a5f-4d52-aee2-b81ce45c8f40)"
    },
...
```
