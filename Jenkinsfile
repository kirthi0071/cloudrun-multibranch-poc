pipeline {

  agent any

  environment {
    PROJECT_ID = "neat-pagoda-477804-m8"
    REGION = "us-central1"
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

          // ---------- PR BUILD HANDLING ----------
          if (env.CHANGE_ID) {
            echo "Pull Request Build Detected - Skipping Deployment Mapping"
            env.ENV = "pr"
            env.SERVICE = "skip"
            env.IMAGE = "skip"
            return
          }

          // ---------- BRANCH MAPPING ----------
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
            error("Unsupported branch: " + env.BRANCH_NAME)
          }

          env.IMAGE = "us-central1-docker.pkg.dev/${PROJECT_ID}/myrepo/backend-${ENV}"
        }
      }
    }

    stage('GCP Auth') {
      when {
        not { changeRequest() }
      }
      steps {
        withCredentials([file(credentialsId: 'gcp-key', variable: 'KEY')]) {
          sh '''
            gcloud auth activate-service-account --key-file=$KEY
            gcloud config set project $PROJECT_ID
            gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
          '''
        }
      }
    }

    stage('Build Image') {
      when {
        not { changeRequest() }
      }
      steps {
        sh "docker build -t $IMAGE ."
      }
    }

    stage('Push Image') {
      when {
        not { changeRequest() }
      }
      steps {
        sh "docker push $IMAGE"
      }
    }

    stage('Prod Approval') {
      when {
        branch 'main'
      }
      steps {
        input message: 'Approve Production Deployment?'
      }
    }

    stage('Deploy To Cloud Run') {
      when {
        not { changeRequest() }
      }
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
