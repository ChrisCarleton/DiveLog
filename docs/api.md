# Dive Log API Documentation
## Error Responses

Errors are reported using a consistent JSON format:

```javascript
{
	errorId: [integer],
	error: [string],
	details: [string]
}
```

The fields are as follows:
* __errorId:__ In integer uniquely identifying the type of error being returned.
* __error:__ A general description of the error.
* __details:__ A further description of the error.

### Error IDs
* __1000:__ Invalid form input.
* __1010:__ Requested user name is already taken.
* __1020:__ Requested e-mail address is already taken.
* __2000:__ Unknown server error.
* __2100:__ Resource not found.
* __3000:__ Authentication failed.
* __3100:__ Not authorized.
* __3200:__ Action forbidden.

## Authentication/Authorization

### Log In Local User

Logs in an existing user (with user name and password) and establishes a user session.

#### Route
```
POST /api/auth/login/
```

#### Data Params
```javascript
{
	username: [string],
	password: [string]
}
```
* __username__: Required. The user name that uniquely identifies the user being authenticated.
* __password__: Required. The user's password.

#### Success Response
__Status Code:__ 200

The details of the newly-authenticated user account are returned.

```javascript
{
	userId: [uuid],
	userName: [string],
	displayName: [string],
	email: [string],
	createdAt: [date/time]
}
```

#### Error Response
* __Status Code 400:__ Bad request
  * __Error ID 1000:__ Validation error. Either the username or password fields were omitted.
* __Status Code 401:__ Not authorized
  * __Error ID 3000:__ Authentication failed. The user name or password (or both) was invalid.
* __Status Code 500:__ Internal server error

### Log Out User

Ends the current user session.

#### Route
```
POST /api/auth/logout/
```

#### Success Response
__Status Code:__ 200

Note that the session cookie will be removed from the request header.

If this no session exists when this route is called it is treated as a no-op rather
than an error.

#### Error Response
* __Status Code 500:__ Internal server error.

## Users

### Create New User (Local)

Creates a new user account in the sytem.

#### Route
```
POST /api/users/
```

#### Data Params
```javascript
{
	usernName: [string],
	email: [string],
	password: [string],
	displayName: [string]
}
```

* __userName:__ Required. A unique user name to identify the new user. Must be alphanumeric though hyphens, underscores, and periods are allowed in the middle. Minimum lenght is 3 characters and maximum is 30.
* __email:__ Required. The e-mail address at which the new user can be contacted. This must also be unique to the user. Only valid e-mail addresses are accepted.
* __password:__ Required. A strong-ish password containing letters, numbers, and special characters. Minimum length is 7 characters and the maximum is 30.
* __displayName:__ Optional. An optional display name (usually the user's full name) to display on the site in place of the user name.

#### Success Response
* __Status Code:__ 200

The details of the newly-created user account are returned.

```javascript
{
	userId: [uuid],
	userName: [string],
	displayName: [string],
	email: [string],
	createdAt: [date/time]
}
```

#### Error Response
* __Status Code 400:__ Bad request
  * __Error ID 1000:__ Validation error. One of the required parameters was omitted or a parameter contained an invalid value. Check the error details for what the problem was.
  * __Error ID 1010:__ User name is taken. The selected user name already belongs to a user in the database. Select a new user name and try again.
  * __Error ID 1020:__ Email is taken. The selected e-mail address already belongs to a user in the database. Perhaps an account recovery is in order?
* __Status Code 500:__ Internal server error.

## Dive Log Entries

### Dive Log Entry Objects
Many of the log entry APIs accept or return a Dive Log Entry Object. Here is the specification:
```javascript
{
	logId: [uuid],
	ownerId: [userId],
	entryTime: [dateAndTime],
	diveNumber: [integer]
	diveTime: {
		exitTime: [dateAndTime],
		surfaceInterval: [integer],
		bottomTime: [dateAndTime],
		decoStops: [
			{
				depth: [number],
				duration: [integer]
			}
		]
	},
	location: [string],
	site: [string],
	gps: {
		latitude: [number],
		longitude: [number]
	},
	cnsO2Percent: [number],
	cylinders: [
		{
			gas: {
				o2Percent: [number],
				hePercent: [number],
				startPressure: [number],
				endPressure: [number]
			},
			volume: [number],
			type: [string],
			number: [number]
		}
	],
	depth: {
		average: [number],
		max: [number]
	},
	temperature: {
		surface: [number],
		water: [number],
		thermocline1: [number],
		thermocline2: [number]
	},
	exposure: {
		body: [string],
		thickness: [number],
		gloves: [boolean],
		hood: [boolean],
		boots: [boolean]
	},
	equipment: {
		compass: [boolean],
		computer: [boolean],
		knife: [boolean],
		light: [boolean],
		scooter: [boolean],
		slate: [boolean],
		surfaceMarker: [boolean]
	},
	diveType: {
		altitude: [boolean],
		boat: [boolean],
		cave: [boolean],
		deep: [boolean],
		drift: [boolean],
		ice: [boolean],
		night: [boolean],
		reef: [boolean],
		saltWater: [boolean],
		searchAndRecovery: [boolean],
		training: [boolean],
		wreck: [boolean]
	},
	visibility: [number],
	current: [number],
	surfaceConditions: [string],
	weather: [string],
	mood: [string],
	weight: {
		amount: [number],
		correctness: [string],
		trim: [string],
		notes: [string]
	},
	notes: [string]
}
```
* __logId:__ A uuid that uniquely identifies the log entry. This is not required when posting, putting, or patching entries - the Log ID will be provided in the route path.
* __ownerId:__ The ID of the user who owns the log entry. This is not required when posting, putting, or patching entries - the user will be provided in the route path.
* __entryTime:__ Required. An ISO date/time string ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)) that indicates when the dive took place (i.e. the start of the descent.)
* __diveNumber:__ A positive integer indicating the dive number for allowing the user to track how many dives they have under their belt.
* __diveTime:__
  * __diveLength:__ Required; a positive integer. The number of minutes the dive lasted for.
  * __exitTime:__ An ISO date/time indicating the dive exit time (i.e. when the diver returned to the surface.)
  * __surfaceInterval:__ A positive integer. Number of minutes of surface interval since the previous dive, if applicable.
  * __bottomTime:__ A positive integer. Number of minutes of bottom time for the dive. (I.e. The number of minutes from the beginning of the initial descent to the beginning of the final ascent.)
  * __decoStops:__ An array of decompression stops made on this dive. May contain up to 10 stops.
    * __depth:__ A positive number at which the depth at which the stop took place.
    * __duration:__ A positive integer indicating the number of minutes that the stop took place for.
* __location:__ Required. The place or city at which the time took place. Max length is 250 characters.
* __site:__ Required. The name of the dive site. Max length is 250 characters.
* __gps:__ The GPS coordinates for the dive site.
  * __latitude__: A string containing either the decimal or sexagesimal representation of latitude coordinates.
  * __longitude__: A string containing either the decimal or sexagesimal representation of longitude coordinates.
* __cnsO2Percent:__ A positive number between 0 and 150 indicating the diver's CNS O2 exposure (percent of maximum) at the end of the dive.
* __cylinders:__ An array listing the cylinders that the diver had with them on this dive. Up to 10 entries are allowed.
  * __gas:__
    * __o2Percent:__ A number between 1 and 100 indicating the percentage of the gas blend that was oxygen.
    * __hePercent:__ A number between 0 and 99 indicating the percentage of the gas blend that was helium.
    * __startPressure:__ A positive number indicating the starting pressure of the cylinder(s). Maximum is 5000psi.
    * __endPressure:__ A positive number indicating the pressure of the cylinder(s). Maximum is 5000psi unless startPressure is specified - it must be less than startPressure.
  * __volume:__ A positive number indicating the volume of the cylinder. Maximum 200cf.
  * __type:__ A string. Valid values are `aluminum` or `steel`.
  * __number:__ A positive integer indicating the number of tanks in the configuration. (E.g. 2 for doubles.)
* __depth:__
  * __average:__ A positive number indicating the average depth of the dive. Maximum 1000ft unless max is specified - it must be less than max.
  * __max:__ Required. A positive number indicating the maximum depth of the dive. Maximum 1000ft.
* __temperature:__
  * __surface:__ A number indicating the surface temperature. Must be between -76F and 150F.
  * __water:__ A number indicating the water temperature at the surface. Must be between 30F and 150F.
  * __thermocline1:__ A number indicating the water temperature below the first thermocline. Must be between 30F and 150F.
  * __thermocline2:__ A number indicating the water temperature below the second thermocline. Must be between 30F and 150F.
* __exposure:__
  * __body:__ String. Valid values are `none`, `shorty`, `full`, and `dry`.
  * __thickness:__ Integer indicating the thickness of the wetsuit, if applicable, (usually 3, 5, or 7mm.) Maximum is 10mm.
  * __gloves:__ Boolean. True if gloves were worn on the dive.
  * __hood:__ Boolean. True if a hood was worn on the dive.
  * __boots:__ Boolean. True if boots were worn on the dive.
* __equipment:__
  * __compass:__ Boolean. True if a compass was worn on the dive.
  * __computer:__ Boolean. True if a computer was worn on the dive.
  * __knife:__ Boolean. True if a knife was carried on the dive.
  * __light:__ Boolean. True if a light was carried on the dive.
  * __scooter:__ Boolean. True if a scooter was brought along on the dive.
  * __slate:__ Boolean. True if a slate was carried on the dive.
  * __surfaceMarker:__ True if a surface marker was carried on the dive.
* __diveType:__
  * __altitude:__ Boolean. True for altitude dives.
  * __boat:__ Boolean. True for boat dives (as opposed to shore dives.)
  * __cave:__ Boolean. True for cave dives.
  * __deep:__ Boolean. True for deep dives.
  * __drift:__ Boolean. True for drift dives.
  * __ice:__ Boolean. True for ice dives.
  * __night:__ Boolean. True for night dives.
  * __reef:__ Boolean. True for reef dives.
  * __saltWater:__ Boolean. True for salt water dives (as opposed to fresh.)
  * __searchAndRecovery:__ Boolean. True for search and recovery dives.
  * __training:__ Boolean. True for training dives.
  * __wreck:__ Boolean. True for wreck dives.
* __visibility:__ A string indicating visibility on the dive. Valid values are `none`, `poor`, `moderate`, `good`, `excellent`, and `ultra`.
* __current:__ A string indicating the strength of the current on the dive. Valid values are `none`, `mild`, `moderate`, `fast`, and `extreme`.
* __surfaceConditions:__ A string indicating the surface conditions. Valid values are `calm`, `moderate`, `rough`, and `insane`.
* __weather:__ A string indicating the weather during the dive. Valid values are `sunny`, `mainlySunny`, `overcast`, `rainy`, and `stormy`.
* __mood:__ A string indicating how the diver felt about the dive. Valid values `terrible`, `bad`, `ok`, `good`, and `excellent`.
* __weight:__ {
  * __amount:__ A positive number indicating how much ballast weight the diver was wearing. Maximum 100lbs.
  * __correctness:__ A string indicating how well the diver was weighted. Valid values are `good`, `too much`, or `too little`.
  * __trim:__ A string indicating how the diver's trim was. Valid values are `good`, `head up`, or `head down`.
  * __notes:__ A free-form string for making notes on weight configuration. Maximum length is 500 characters.
* __notes:__ A free-form string for making notes on the dive in general. Maximum length is 1500 characters.

### List Log Entries

Gets an ordered list of dive log entries for a user.

#### Route
```
GET /api/logs/:userName/
```
* __:userName__ The user name that identifies the user for which log entries should be returned.

#### Query Params
```
?before=2017-04-21T09:18:00.000Z&after=2017-01-01T00:00:00.000Z&order=desc&limit=50
```
All of the query parameters are optional.
* __order:__ Valid values are `asc` or `desc`. Results are ordered by the dive entry times. The default is descending order (reverse-chronological order.) For chronological order set order to `asc`.
* __before:__ An ISO 8601 date and time string. When specified, only log entries with dive entry times that occurred before this time will be returned.
* __after:__  An ISO 8601 date and time string. When specified, only log entries with dive entry times that occurred after this time will be returned.
* __limit:__ The maximum number of records to return in the result set. Must be a positive integer between 1 and 1000.

#### Success Response
* __Status Code:__ 200

Returns an array of dive log entries matching the supplied query parameters. The entries will contain a subset of the fields for a full dive log entry:
```javascript
[
	{
		logId: [uuid],
		ownerId: [userId],
		entryTime: [isoDate],
		location: [string],
		site: [string],
		depth: {
			average: [number],
			max: [number]
		}
	},
	...
]
```

#### Error Response
* __Status Code 400:__ Bad request. One or more of the query string parameters is invalid.
* __Status Code 401:__ Not authorized. The current user is not authorized to view the log book for the requested `:userName` or the current user is unauthenticated.
* __Status Code 500:__ Internal server error.


### Create New Dive Log Entry

Creates a new dive log entry in the specified user's log book.

#### Route
```
POST /api/logs/:userName/
```
* __:userName__ The user name that identifies the user for which log entries should be returned.

#### Data Params
The method accepts a Dive Log Entry Object.

#### Success Response
* __Status Code:__ 200

The newly-created Dive Log Entry Object is returned with `logId` and `createdAt` fields populated.

#### Error Response
* __Status Code 400:__ Bad request. One or more of the fields of the new log entry was invalid. See Dive Log Entry Object for the proper specification.
* __Status Code 401:__ Not authorized. The current user is not permitted to add logs to the log book for the requested `:userName` or the current user is unauthenticated.
* __Status Code 403:__ Forbidden. The `ownerId` field was set to a value that did not match the user Id of the user indicated in the `:userName` route parameter.
* __Status Code 500:__ Internal server error.

### Retrieve a Dive Log Entry

Retrieves a log entry from the specified user's log book.

#### Route
```
GET /api/logs/:userName/:logId/
```
* __:userName__ The user name that identifies the user for which log entries should be returned.
* __:logId__ The ID of the log entry to be retrieved.

#### Success Response
* __Status Code:__ 200

The Dive Log Entry Object is returned in the response body.

#### Error Response
* __Status Code 401:__ Not authorized. The current user is not permitted to view the entries in the log book for the requested `:userName` or the current user is unauthenticated.
* __Status Code 500:__ Internal server error.

### Delete a Dive Log Entry

Deletes a log entry from the specified user's log book.

#### Route
```
DELETE /api/logs/:userName/:logId/
```
* __:userName__ The user name that identifies the user for which log entry should be deleted.
* __:logId__ The ID of the log entry to be deleted.

#### Success Response
* __Status Code:__ 200

#### Error Response
* __Status Code 401:__ Not authorized. The current user is not permitted to delete the entries in the log book for the requested `:userName` or the current user is unauthenticated.
* __Status Code 500:__ Internal server error.

### Update An Existing Dive Log Entry

Creates a new dive log entry in the specified user's log book.

#### Route
```
PUT|PATCH /api/logs/:userName/:logId/
```
* __:userName__ The user name that identifies the user for which the log entry should be updated.
* __:logId__ The ID of the log entry to be updated.

This route will respond on both `PUT` and `PATCH` HTTP verbs. (Technically, the operation is more of a `PATCH` but `PUT` is aliased nonetheless.)

#### Data Params
The method accepts a Dive Log Entry Object with updated field values. Fields that are not being updated can be omitted - they will retain their values. Non-required fields can be deleted by setting their values to `null`.

#### Success Response
* __Status Code:__ 200

The newly-created Dive Log Entry Object is returned with `logId` and `createdAt` fields populated.

#### Error Response
* __Status Code 400:__ Bad request. One or more of the fields of the new log entry was invalid. See Dive Log Entry Object for the proper specification.
* __Status Code 401:__ Not authorized. The current user is not permitted to add logs to the log book for the requested `:userName` or the current user is unauthenticated.
* __Status Code 403:__ Forbidden. A forbidden action was taken. One of:
  * The `ownerId` field was set to a value that did not match the user Id of the user indicated in the `:userName` route parameter.
  * A required field was requested to be removed (by setting it's value to `null` in the request body.)
* __Status Code 500:__ Internal server error.

