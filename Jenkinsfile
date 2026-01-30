pipeline {

  agent any

  environment {
    PROJECT_ID = "neat-pagoda-477804-m8"
    REGION = "asia-south1"
  }

  stages {

    stage('Branch Detection') {
      steps {
        echo "Branch Name: ${env.BRANCH_NAME}"
      }
    }

    stage('Set Environment') {
      steps {
        script {

          if (env.BRANCH_NAME == 'dev') {
            env.ENV = 'dev'
            env.SERVICE = 'backend-dev'
          }
          else if (env.BRANCH_NAME == 'staging') {
            env.ENV = 'staging'
            env.SERVICE = 'backend-staging'
          }
          else if (env.BRANCH_NAME == 'main') {
            env.ENV = 'prod'
            env.SERVICE = 'backend-prod'
          }
          else {
            error("Unsupported branch")
          }

          env.IMAGE = "us-central1-docker.pkg.dev/${PROJECT_ID}/myrepo/backend-${ENV}"
        }
      }
    }

    stage('Build Image') {
      steps {
        sh "docker build -t $IMAGE ."
      }
    }

    stage('Push Image') {
      steps {
        sh "docker push $IMAGE"
      }
    }

    stage('Deploy To Cloud Run') {
      steps {
        sh """
        gcloud run deploy $SERVICE \
        --image $IMAGE \
        --region $REGION \
        --allow-unauthenticated \
        --port 8080
        """
      }
    }

  }
}
