
import os
import json
from datetime import datetime
from bson.objectid import ObjectId
from bson.json_util import dumps
# import pymongo

def writeCampaign(fileName, name, handle):
    layerMapping = {
        "0": "target",
        "1": "intermediate",
        "2": "source",
        "3": "source",
        "4": "unrelated",
        "5": "unrelated",
        "6": "unrelated",
        "7": "unrelated"
    }

    # mongodb user id, fill this in appropriately
    userid = ObjectId('5644566d730b8ae018eef276')

    campaign_file = open(fileName, 'r')
    campaign_json = json.load(campaign_file)

    for node in campaign_json['nodes']:
        node['layer'] = layerMapping.get(node['LayerNo'], 'unrelated')
        node['data'] = {}
        node['data']['user'] = {}
        node['data']['user']['screen_name'] = node['id']

    campaign = {
        'author': userid,
        'description': "",
        'handle': handle,
        'name': name,
        'state': 'completed',
        'creationDate': datetime.now().isoformat(),
        'endDate': datetime.now().isoformat(),
        'startDate': datetime.now().isoformat(),
        'networkGraph': campaign_json,
        'sources': [],
        'targets': [],
        'completed': True,
        'running': False,
    }
    new_campaign = open(str(campaign_file.name) + '.campaign.json', 'w')

    final_json = dumps(campaign)
    new_campaign.write(final_json)


json_files = ['CARcrisis_json_0.3.json',]
writeCampaign('CARcrisis_json_0.3.json', 'CarCrisis', 'carcrisis')
writeCampaign('ChinaWR_json_0.2.json', 'China WR', 'chinawr')
writeCampaign('EgyptWR_json_0.3.json', 'Egypt WR', 'egyptwr')
writeCampaign('WR2015_json_0.1.json', 'WR 2015', 'wr2015')
writeCampaign('WR2015_json_0.1.json', 'WR 2015', 'wr2015')
writeCampaign('WRPrinciple_json_0.1.json', 'WR Principle', 'wrprinciple')

