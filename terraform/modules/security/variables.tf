variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "frontend_port" {
  type    = number
  default = 3000
}

variable "backend_port" {
  type    = number
  default = 5000
}

variable "admin_cidr_blocks" {
  description = "Allowed CIDR blocks for administrative access (Jenkins, Grafana)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "vpc_cidr" {
  description = "VPC CIDR block for internal private monitoring access (Prometheus, Node Exporter)"
  type        = string
  default     = "10.0.0.0/16"
}
