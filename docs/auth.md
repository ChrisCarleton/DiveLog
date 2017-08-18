# Authentication/Authorization

[Back to API documentation](./api.md)

## Log In Local User

Logs in an existing user (with user name and password) and establishes a user session.

### Route
```
POST /api/auth/login/
```

### Data Params
```javascript
{
	username: [string],
	password: [string]
}
```
* __username__: Required. The user name that uniquely identifies the user being authenticated.
* __password__: Required. The user's password.

### Success Response
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

### Error Response
* __Status Code 400:__ Bad request
  * __Error ID 1000:__ Validation error. Either the username or password fields were omitted.
* __Status Code 401:__ Not authorized
  * __Error ID 3000:__ Authentication failed. The user name or password (or both) was invalid.
* __Status Code 500:__ Internal server error

## Log Out User

Ends the current user session.

### Route
```
POST /api/auth/logout/
```

### Success Response
__Status Code:__ 200

Note that the session cookie will be removed from the request header.

If this no session exists when this route is called it is treated as a no-op rather
than an error.

### Error Response
* __Status Code 500:__ Internal server error.

## Create New User (Local)

Creates a new user account in the sytem.

### Route
```
POST /api/users/
```

### Data Params
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

### Success Response
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

### Error Response
* __Status Code 400:__ Bad request
  * __Error ID 1000:__ Validation error. One of the required parameters was omitted or a parameter contained an invalid value. Check the error details for what the problem was.
  * __Error ID 1010:__ User name is taken. The selected user name already belongs to a user in the database. Select a new user name and try again.
  * __Error ID 1020:__ Email is taken. The selected e-mail address already belongs to a user in the database. Perhaps an account recovery is in order?
* __Status Code 500:__ Internal server error.

## List Connected OAuth Providers

Lists the connected OAuth providers for a given user.

### Route
```
GET /api/auth/:user/oauth/
```
* __:user__ The User Name of the user for which connected OAuth providers should be retrieved.

### Success Response
* __Status Code:__ 200

An array of strings listing the OAuth providers connected to the specified user's account. Example:

```javascript
['google', 'github']
```

__Note:__ Returns an empty array if no OAuth providers are connected to the user's account.

### Error Response
* __Status Code 401:__ Not authorized. The current user is either unauthenticated or not authorized to list the connected OAuth providers for the specified user.
* __Status Code 500:__ Internal server error.

## Delete a Connected OAuth Provider

Removes a user's connected OAuth provider record.

### Route
```
DELETE /api/auth/:user/oauth/:provider
```
* __:user__ The user name that identifies the user for which log entries should be returned.
* __:provider__ The OAuth provider to detach from the given user's profile. Valid values are `google`, `facebook`, and `github`.

### Success Response
* __Status Code:__ 200

### Error Response
* __Status Code 400:__ Bad request. An invalid provider was specified in the route path. Only `google`, `facebook`, and `github` are permitted.
* __Status Code 401:__ Not authorized. The current user is not authorized to remove OAuth providers from the given user's profile.
* __Status Code 403:__ Forbidden. This is returned when an attempt is made to remove the last OAuth provider from a user account that does not have a password set for local login. Users must be able to log in with at least one OAuth provider if they cannot log in locally using a traditional username/password.
* __Status Code 404:__ Resource not found. Site administrators will receive a 404 response if trying to delete OAuth providers from users that do not exist. (Non-administrative users will simply receive a 401 response.)
* __Status Code 500:__ Internal server error.
