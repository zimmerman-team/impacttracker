mapping = {
    "Civil Society": {
        "Amnesty International": {},
        "Committee to Protect Journalists": {},
        "RJDHRCA": {},
        "Doctors without Borders": {},
        "Responsibility to Protect": {},
        "Enough Project": {},
        "Mines Action Canada": {},
        "Miscellaneous": {}
    },
    "International Organizations": {
        "European Union": {},
        "NATO": {},
        "OSCE": {},
        "United Nations": {
            "General": {},
            "UNICEF": {},
            "UNHCR": {},
            "OCHA": {},
            "World Food Programme": {},
            "UNDP": {},
            "FAO": {},
            "Other": {}
        }
    },

    "Journalism": {
        "AFP": {},
        "al Jazeera": {},
        "BBC": {},
        "Bloomberg News": {},
        "CNN": {},
        "New York Times": {},
        "Thomson Reuters": {},
        "Wall Street Journal": {},
        "Miscellaneous": {},
        "Independent journalist": {}
    },
    "Public Authorities": {
        "Governments": {},
        "Politicians": {}
    },
    "Research": {
        "Academic": {},
        "Other (incl. Think Tank, Consultancy)": {}
    },
    "Miscellaneous": {}
}

reversemapping = {
        "Amnesty International": ["Civil Society"],
        "Committee to Protect Journalists": ["Civil Society"],
        "RJDHRCA": ["Civil Society"],
        "Doctors without Borders": ["Civil Society"],
        "Responsibility to Protect": ["Civil Society"],
        "Enough Project": ["Civil Society"],
        "Mines Action Canada": ["Civil Society"],
        "Miscellaneous": ["Civil Society"],

        "European Union": ["International Organizations"],
        "NATO": ["International Organizations"],
        "OSCE": ["International Organizations"], 
        "General": ["International Organizations", "United Nations"],
        "UNICEF": ["International Organizations", "United Nations"],
        "UNHCR": ["International Organizations", "United Nations"],
        "OCHA": ["International Organizations", "United Nations"],
        "World Food Programme": ["International Organizations", "United Nations"],
        "UNDP": ["International Organizations", "United Nations"],
        "FAO": ["International Organizations", "United Nations"],
        "Other": ["International Organizations", "United Nations"],

        "AFP": ["Journalism"],
        "al Jazeera": ["Journalism"],
        "BBC": ["Journalism"],
        "Bloomberg News": ["Journalism"],
        "CNN": ["Journalism"],
        "New York Times": ["Journalism"],
        "Thomson Reuters": ["Journalism"],
        "Wall Street Journal": ["Journalism"],
        "Miscellaneous": ["Journalism"],
        "Independent journalist": ["Journalism"],

        "Governments": ["Public Authorities"],
        "Politicians": ["Public Authorities"],

        "Academic": ["Research"],
        "Other (incl. Think Tank, Consultancy)": ["Research"],

        "Miscellaneous": [],

        "Human Rights Watch": []
}

twitter_category_mapping = {}

import csv
with open('ImpactTrackertargets.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row['twitter_screen_name']
        group = row['Affiliation']

        categories = []

        # print(row)
        for key, value in row.iteritems():
            if value == "1" and not (key in ('tweets_by_target', 'nr_friends', '',)):
                categories.append(key)

        # if len(categories) > 1: 
        #     print("NOOOOOOOOO")
        #     print(key)
        #     print(categories)
        #     exit(1)
        if len(categories) > 0:
            category = categories[0]

            # twitter_category_mapping[name] = ",".join(categories)
            try:
                nested_categories = reversemapping[category] + [category]
            except Exception, e:
                print(repr(e))

            if nested_categories:
                twitter_category_mapping[name] = nested_categories


        # category_map[name]

# print twitter_category_mapping

import json

filename = 'CARcrisis_json_0.2.json'
outfilename = 'CARcrisis_json_0.3.json'

with open(filename) as data_file:
    data = json.load(data_file)

for item in data['nodes']:
    item["categories"] = twitter_category_mapping.get(item["id"], [])

    # if len(item["categories"]):
    #     print(item)

with open(outfilename, 'w') as outfile:
    json.dump(data, outfile)

