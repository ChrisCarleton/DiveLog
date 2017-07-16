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
// TODO
```

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

