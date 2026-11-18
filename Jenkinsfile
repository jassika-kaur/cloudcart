pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    environment {
        // Docker Hub Configuration (Credentials configured in Jenkins Credentials Manager)
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USER           = 'jassikakaur'
        FRONTEND_IMAGE           = 'jassikakaur/cloudcart-frontend'
        BACKEND_IMAGE            = 'jassikakaur/cloudcart-backend'

        // AWS Configuration (Credentials configured in Jenkins Credentials Manager)
        AWS_CREDENTIALS_ID       = 'aws-credentials'
        AWS_DEFAULT_REGION       = 'ap-south-1'
        ALB_DNS_NAME             = 'cloudcart-production-alb-1269005310.ap-south-1.elb.amazonaws.com'

        // Dynamic Image Tags
        IMAGE_TAG                = "${env.BUILD_NUMBER}"
        COMMIT_SHA               = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"
    }

    stages {
        // ---------------------------------------------------------------------
        // Stage 1: Source Code Checkout
        // ---------------------------------------------------------------------
        stage('Checkout Source') {
            steps {
                echo "=== Stage 1: Checking out source code from GitHub ==="
                checkout scm
                script {
                    echo "Branch: ${env.GIT_BRANCH}"
                    echo "Commit: ${env.GIT_COMMIT}"
                }
            }
        }

        // ---------------------------------------------------------------------
        // Stage 2: Dependency Installation
        // ---------------------------------------------------------------------
        stage('Install Dependencies') {
            steps {
                echo "=== Stage 2: Installing Backend and Frontend Dependencies ==="
                dir('backend') {
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        // ---------------------------------------------------------------------
        // Stage 3: Code Compilation & Build
        // ---------------------------------------------------------------------
        stage('Code Build') {
            steps {
                echo "=== Stage 3: Compiling React Production Assets ==="
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        // ---------------------------------------------------------------------
        // Stage 4: Automated Testing
        // ---------------------------------------------------------------------
        stage('Automated Testing') {
            steps {
                echo "=== Stage 4: Executing Automated Backend Integration Tests ==="
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        // ---------------------------------------------------------------------
        // Stage 5: Docker Image Build
        // ---------------------------------------------------------------------
        stage('Docker Image Build') {
            steps {
                echo "=== Stage 5: Building Production Docker Images ==="
                sh """
                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                 -t ${FRONTEND_IMAGE}:${COMMIT_SHA} \
                                 -t ${FRONTEND_IMAGE}:latest ./frontend
                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                                 -t ${BACKEND_IMAGE}:${COMMIT_SHA} \
                                 -t ${BACKEND_IMAGE}:latest ./backend
                """
            }
        }

        // ---------------------------------------------------------------------
        // Stage 6: Docker Image Push
        // ---------------------------------------------------------------------
        stage('Push to Docker Hub') {
            steps {
                echo "=== Stage 6: Pushing Images to Docker Hub ==="
                withCredentials([usernamePassword(
                    credentialsId: DOCKERHUB_CREDENTIALS_ID,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:${COMMIT_SHA}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:${COMMIT_SHA}
                        docker push ${BACKEND_IMAGE}:latest
                        docker logout
                    """
                }
            }
        }

        // ---------------------------------------------------------------------
        // Stage 7: Deploy to AWS EC2 via AWS Systems Manager (SSM)
        // ---------------------------------------------------------------------
        stage('Deploy to AWS EC2') {
            steps {
                echo "=== Stage 7: Deploying Updated Application to AWS EC2 ==="
                withCredentials([usernamePassword(
                    credentialsId: AWS_CREDENTIALS_ID,
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    sh """
                        export AWS_ACCESS_KEY_ID="\$AWS_ACCESS_KEY_ID"
                        export AWS_SECRET_ACCESS_KEY="\$AWS_SECRET_ACCESS_KEY"
                        export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION}"

                        # Fetch active EC2 instances tagged for CloudCart application
                        INSTANCE_IDS=\$(aws ec2 describe-instances \
                            --filters "Name=tag:Name,Values=cloudcart-app-worker" "Name=instance-state-name,Values=running" \
                            --query "Reservations[*].Instances[*].InstanceId" \
                            --output text)

                        if [ -z "\$INSTANCE_IDS" ]; then
                            # Fallback: query by CloudCart Launch Template instances
                            INSTANCE_IDS=\$(aws ec2 describe-instances \
                                --filters "Name=tag:aws:autoscaling:groupName,Values=cloudcart-production-asg-*" "Name=instance-state-name,Values=running" \
                                --query "Reservations[*].Instances[*].InstanceId" \
                                --output text)
                        fi

                        echo "Found active target EC2 instances: \$INSTANCE_IDS"

                        # Dispatch container rollout command across all cluster instances
                        COMMAND_ID=\$(aws ssm send-command \
                            --instance-ids \$INSTANCE_IDS \
                            --document-name "AWS-RunShellScript" \
                            --parameters commands='[
                                "docker pull '${FRONTEND_IMAGE}':latest",
                                "docker pull '${BACKEND_IMAGE}':latest",
                                "docker stop cloudcart-frontend 2>/dev/null || true",
                                "docker rm cloudcart-frontend 2>/dev/null || true",
                                "docker run -d --name cloudcart-frontend --restart unless-stopped --network cloudcart-net --network-alias frontend -p 3000:80 '${FRONTEND_IMAGE}':latest",
                                "docker stop cloudcart-backend 2>/dev/null || true",
                                "docker rm cloudcart-backend 2>/dev/null || true",
                                "docker run -d --name cloudcart-backend --restart unless-stopped --network cloudcart-net --network-alias backend -p 5000:5000 --env-file /opt/cloudcart/.env -e AWS_REGION='${AWS_DEFAULT_REGION}' '${BACKEND_IMAGE}':latest",
                                "echo Rollout complete."
                            ]' \
                            --query "Command.CommandId" \
                            --output text)

                        echo "Dispatched SSM Command ID: \$COMMAND_ID. Waiting for execution..."
                        aws ssm wait command-executed --command-id "\$COMMAND_ID" --instance-id \$(echo \$INSTANCE_IDS | awk '{print \$1}')
                        echo "EC2 rollout executed successfully."
                    """
                }
            }
        }

        // ---------------------------------------------------------------------
        // Stage 8: Post-Deployment Health Check
        // ---------------------------------------------------------------------
        stage('Post-Deployment Health Check') {
            steps {
                echo "=== Stage 8: Verifying Live Application Health via ALB DNS ==="
                sh """
                    echo "Checking Frontend at http://${ALB_DNS_NAME}/ ..."
                    curl -s -f --retry 6 --retry-delay 5 --retry-connrefused "http://${ALB_DNS_NAME}/" > /dev/null
                    echo "Frontend is UP and healthy!"

                    echo "Checking Backend API at http://${ALB_DNS_NAME}/api/health ..."
                    HEALTH_RESPONSE=\$(curl -s -f --retry 6 --retry-delay 5 --retry-connrefused "http://${ALB_DNS_NAME}/api/health")
                    echo "Backend Health Response: \$HEALTH_RESPONSE"
                    echo "\$HEALTH_RESPONSE" | grep -q "OK"
                    echo "Backend API is UP and healthy!"
                """
            }
        }
    }

    // -------------------------------------------------------------------------
    // Post-Build Notifications and Cleanup
    // -------------------------------------------------------------------------
    post {
        always {
            echo "=== CI/CD Pipeline Completed: Cleaning temporary build artifacts ==="
            cleanWs deleteDirs: true, notFailBuild: true
        }
        success {
            echo "SUCCESS: CloudCart deployment #\${env.BUILD_NUMBER} succeeded! Live at http://${ALB_DNS_NAME}"
        }
        failure {
            echo "FAILURE: CloudCart deployment #\${env.BUILD_NUMBER} failed. Immediate rollback / inspection recommended."
        }
    }
}
