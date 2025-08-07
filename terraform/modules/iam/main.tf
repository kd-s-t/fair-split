# IAM Module
# Handles IAM roles, policies, and instance profiles for SplitSafe application
# 
# This module manages:
# - IAM roles for EC2 instances
# - IAM policies for ECR and SSM access
# - Instance profiles for EC2
# - Cross-service permissions

# =============================================================================
# IAM ROLES & POLICIES
# =============================================================================

# IAM Role for EC2 to access ECR and SSM
resource "aws_iam_role" "ec2_role" {
  name = "splitsafe-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "splitsafe-ec2-role-${var.environment}"
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

# IAM Policy for ECR and SSM access
resource "aws_iam_role_policy" "ecr_policy" {
  name = "splitsafe-ecr-policy-${var.environment}"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:DescribeRepositories"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:us-east-1:456783087661:parameter/splitsafe/*"
      }
    ]
  })
}

# Attach SSM managed policy for EC2 to connect to Systems Manager
resource "aws_iam_role_policy_attachment" "ssm_managed_instance_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance Profile for EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "splitsafe-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2_role.name
} 