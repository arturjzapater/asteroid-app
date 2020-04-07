'use strict'
const request = require('lib/request')

const writeInfo = asteroid =>
`${asteroid.name} will be approaching Earth on ${asteroid.approachDate} at a speed of ${asteroid.speed.toFixed(2)} km/s.
It will be ${asteroid.distance.toFixed(1)} kilometers away from Earth.
It is${asteroid.dangerous ? ' ' : ' not '}potentially dangerous.
Its estimated diameter is between ${asteroid.eDiameter.min.toFixed(2)} and ${asteroid.eDiameter.max.toFixed(2)} meters.
For more info, check ${asteroid.url}`

const getAsteroidInfo = num => arr => arr
	.slice(0, num)
	.map(writeInfo)

const parseAsteroids = obj => obj.map(x => ({
	name: x.name,
	approachDate: x.close_approach_data[0].close_approach_date_full,
	dangerous: x.is_potentially_hazardous_asteroid,
	distance: +x.close_approach_data[0].miss_distance.kilometers,
	eDiameter: {
		min: x.estimated_diameter.meters.estimated_diameter_min,
		max: x.estimated_diameter.meters.estimated_diameter_max,
	},
	speed: +x.close_approach_data[0].relative_velocity.kilometers_per_second,
	url: x.nasa_jpl_url,
}))

const parseResponse = ({ near_earth_objects: objs }) => Object
	.keys(objs)
	.flatMap(x => parseAsteroids(objs[x]))
	.sort((a, b) => a.distance - b.distance)

module.exports = ({ host, path, key }) => (start, end) => request({
	host,
	path: `${path}?start_date=${start}&end_date=${end}&api_key=${key}`
}).then(({ body }) => JSON.parse(body))
	.then(parseResponse)
	.then(getAsteroidInfo(1))
