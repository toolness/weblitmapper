var fs = require('fs');
var _ = require('underscore');
var csvrow = require('csvrow');

var rows = fs.readFileSync(__dirname + '/weblitmap.csv', 'utf-8')
  .split('\n').slice(1);

var strands = exports.strands = [];
var tags = exports.tags = {};

var currentStrand, currentCompetency;

function tagWithParents(tag, deps) {
	var thing = tags[tag];

	if (!Array.isArray(deps)) deps = [];

	deps.push(thing.tag);

	if (thing.type == 'skill')
		return tagWithParents(thing.competency.tag, deps);
	if (thing.type == 'competency')
		return tagWithParents(thing.strand.tag, deps);
	return _.flatten(deps);
}

rows.forEach(function(row) {
	row = csvrow.parse(row);

	var strand = row[0];
	var competency = row[1];
	var skill = row[2];
	var tag = row[3].slice(1).toLowerCase();

	if (strand) {
		currentStrand = {
			type: 'strand',
			name: strand,
			competencies: [],
			tag: tag
		};
		strands.push(currentStrand);
		tags[tag] = currentStrand;
	} else if (competency) {
		currentCompetency = {
			type: 'competency',
			name: competency,
			strand: currentStrand,
			skills: [],
			tag: tag
		};
		currentStrand.competencies.push(currentCompetency);
		tags[tag] = currentCompetency;
	} else if (skill) {
		tags[tag] = {
			type: 'skill',
			competency: currentCompetency,
			name: skill,
			tag: tag
		};
		currentCompetency.skills.push(tags[tag]);
	}
});

exports.normalizeTags = normalizeTags = function normalizeTags(tagList) {
	return _.uniq(_.flatten(tagList
	  .map(function lowercaseTag(tag) { return tag.toLowerCase(); })
	  .filter(function isTagValid(tag) { return tag in tags; })
	  .map(tagWithParents)));
};
