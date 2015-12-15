
// Get all of the CVEs and their corresponding vulnerable packages
// This shows us the most vulnerable-ifying CVEs
db.datas.aggregate([{$unwind: '$parsed_cve_list'}, {$group: {_id: {cve: '$parsed_cve_list',source: '$source'}}}, {$group: {_id: '$_id.cve', count: {$sum: 1}, sources: {$addToSet: '$_id.source'}}}, {$sort: {count: -1}}])

// Get count of unique CVEs
db.datas.aggregate([{$unwind: '$cve_list'}, {$match: {'cve_list': {$ne: ""}}}, {$group: {_id: '$cve_list'}}, {$group: {_id: 1, count: {$sum: 1}}}])

// Get number of CVEs
db.datas.aggregate([{$unwind: '$cve_list'}, {$match: {'cve_list': {$ne: ""}}}, {$group: {_id: 1, count: {$sum: 1}}}])

// Get top parsed CVEs
// db.datas.aggregate([{$unwind: '$parsed_cve_list'}, {$group: {_id: {cve: '$parsed_cve_list',source: '$source'}}}, {$group: {_id: '$_id.cve', count: {$sum: 1}}}, {$sort: {'count': -1}}])
