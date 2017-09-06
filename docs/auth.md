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

## Change User Password

Changes the password for a given user account.

### Route
```
POST /api/auth/:user/password
```

* __:user__ The user name indicating the user whose password should be changed.

### Data Params
```javascript
{
	oldPassword: [string],
	newPassword: [string]
}
```

* __oldPassword:__ The user's current password. This is needed to verify the user's identity.
* __newPassword:__ The new password to assign to the user's account.

### Success Response
* __Status Code:__ 200

An HTTP 200 response indicates that the password has been successfully changed.

### Error Response
* __Status Code 400:__ Bad request. The change was rejected because `newPassword` did not meet password strength requirements.
* __Status Code 401:__ Not authorized. This response can result from any of the following conditions:
  * The current user is unauthenticated.
  * The current user is not authorized to change the password of the user requested in the `:user` parameter of the route path.
* __Status Code 404:__ Not found. Returned to administrative users who try to change the password for a user that does not exist.

## Request Password Reset

Requests that a URL containing a password reset token be e-mailed to the user so that they can change a forgotten password.

### Route
```
GET /api/auth/resetPassword
```
### Query Params
* __email:__ The e-mail address to which the password-reset URL will be e-mailed to.

_NOTE:_ The e-mail will only be sent out if the e-mail address belongs to a user account in the app. The API will return
a 200 success HTTP code regardless!

### Success Response
* __Status Code:__ 200

The reset e-mail was sent out successfully (or the e-mail address was not registered in the app and the API has failed silently.)

### Error Response
* __Status Code 400:__ Bad request. The `email` query parameter was missing or was not a valid e-mail address.
* __Status Code 500:__ Server error. The e-mail could not be delivered or some other unexpected server-side error occurred.

## Confirm Password Reset

Changes the password for the specified user account given a valid reset token.

### Route
```
POST /api/auth/:user/resetPassword
```

* __:user__ The user name indicating the user whose password should be changed.

### Data Params
```javascript
{
	token: [string],
	newPassword: [string]
}
```

* __token:__ A temporary password reset token. These get e-mailed out when users request a password reset. The token needs to be correct in order to successfully change the password.
* __newPassword:__ The new password to assign to the user's account.

### Success Response
* __Status Code:__ 200

An HTTP 200 response indicates that the password has been successfully changed.

### Error Response
* __Status Code 400:__ Bad request. The change was rejected because of one of the following reasons:
  * The `token` parameter was missing.
  * The `newPassword` parameter was missing.
  * The `newPassword` parameter did not meet strength requirements.
* __Status Code 401:__ Not authorized. This response can result from any of the following conditions:
  * The indicated user account does not exist.
  * The reset token is incorrect.
  * The reset token has expired.
* __Status Code 500:__ Server error. Returned in the event of an unexpected server error.

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
