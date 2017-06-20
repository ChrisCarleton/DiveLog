variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_region" {}
variable "env" {}

provider "aws" {
	access_key = "${var.aws_access_key}"
	secret_key = "${var.aws_secret_key}"
	region = "${var.aws_region}"
}

resource "aws_dynamodb_table" "users_table" {
	name = "divelog-${var.env}-users"
	read_capacity = 1
	write_capacity = 1
	hash_key = "userId"

	attribute {
		name = "userId"
		type = "S"
	}

	attribute {
		name = "userName"
		type = "S"
	}

	attribute {
		name = "email"
		type = "S"
	}

	attribute {
		name = "displayName"
		type = "S"
	}

	attribute {
		name = "passwordHash"
		type = "S"
	}

	global_secondary_index {
		name = "UserNameIndex"
		hash_key = "userName"
		projection_type = "ALL"
		read_capacity = 1
		write_capacity = 1
	}

	global_secondary_index {
		name = "EmailIndex"
		hash_key = "email"
		projection_type = "ALL"
		read_capacity = 1
		write_capacity = 1
	}
}

resource "aws_dynamodb_table" "oauth_table" {
	name = "divelog-${var.env}-oauth"
	read_capacity = 1
	write_capacity = 1
	hash_key = "providerId"
	range_key = "provider"

	attribute {
		name = "providerId"
		type = "S"
	}

	attribute {
		name = "provider"
		type = "S"
	}

	attribute {
		name = "userId"
		type = "S"
	}

}
