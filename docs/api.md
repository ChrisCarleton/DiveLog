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
/api/auth/login/
```

#### Method

```
POST
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
##### Status Code 400
* __Error ID 1000:__ Validation error. A required field was omitted or a field value was invalid. See error details for more information.

##### Status Code 401
* __Error ID 3000:__ Authentication failed. The user name or password (or both) was invalid.


### Log Out User

Ends the current user session.

#### Route

```
/api/auth/logout/
```

#### Method
```
POST
```

#### Success Response
__Status Code:__ 200

Note that the session cookie will be removed from the request header.

If this no session exists when this route is called it is treated as a no-op rather
than an error.

## Users

### Create New User (Local)