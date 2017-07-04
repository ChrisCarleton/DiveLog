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
