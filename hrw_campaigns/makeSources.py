import json
from bson.objectid import ObjectId
from bson.json_util import dumps

source_file = open('list.twitter.txt', 'r')
sources = json.load(source_file)

# userid = ObjectId('5630c26f447f9c693df5ed5d')
userid = ObjectId('55ba3fb4c4f29ed665097c64')

source_obj = []

for source in sources['users']:
    source_obj.append({
        'author': userid,
        'user_id': source['id_str'],
        'screen_name': source['screen_name'],
    })

new_sources = open('list.twitter.txt.sources.txt', 'w')
json = dumps(source_obj)
new_sources.write(json)
    
    
