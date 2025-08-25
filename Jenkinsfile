pipeline {
    agent any

    tools { nodejs 'NodeJS-18' }

    environment {
        NODE_VERSION = '18'
        APP_NAME = 'mon-app-js'
        DEPLOY_DIR = '/Users/alexandre/Dev/WebstormProjects/mon-app-js'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Récupération du code source...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installation des dépendances Node.js...'
                sh '''
                    node --version
                    npm --version
                    npm ci
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Exécution des tests...'
                sh 'npm test'
            }
            post {
                always {
                    junit testResults: 'test-results.xml', allowEmptyResults: true
                }
            }
        }

        stage('Code Quality Check') {
            steps {
                echo 'Vérification de la qualité du code...'
                sh '''
                    echo "Vérification de la syntaxe JavaScript..."
                    find src -name "*.js" -exec node -c {} \\;
                    echo "Vérification terminée"
                '''
            }
        }

        stage('Build') {
            steps {
                echo 'Construction de l\'application...'
                sh '''
                    npm run build
                    ls -la dist/
                '''
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Analyse de sécurité...'
                sh '''
                    echo "Vérification des dépendances..."
                    npm audit --audit-level=high
                '''
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Déploiement vers l\'environnement de staging...'
                sh '''
                    echo "Déploiement staging simulé"
                    mkdir -p staging
                    cp -r dist/* staging/
                '''
            }
        }

        stage('Deploy to Production') {
          when { anyOf { branch 'main'; expression { !env.BRANCH_NAME } } }
          steps {
            echo 'Démarrage local depuis le workspace…'
            sh '''
              set -e
              # stop propre
              if [ -f server.pid ]; then
                OLD_PID=$(cat server.pid || true)
                if [ -n "$OLD_PID" ] && ps -p "$OLD_PID" > /dev/null 2>&1; then
                  kill "$OLD_PID" || true
                  sleep 1
                fi
                rm -f server.pid
              fi

              # lancer server.js (qui sert dist/)
              echo "Lancement: node server.js (PORT=$LOCAL_PORT)"
              PORT="$LOCAL_PORT" nohup node server.js > server.log 2>&1 & echo $! > server.pid
              echo "Serveur démarré. PID=$(cat server.pid)"
            '''
          }
        }

        /*stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    expression { return !env.BRANCH_NAME } // job non-multibranch
                }
            }
            steps {
                echo 'Démarrage local avec server.js...'
                sh '''
                set -e
                # Stop propre si déjà lancé
                if [ -f "$SERVER_PID" ]; then
                    OLD_PID=$(cat "$SERVER_PID" || true)
                    if [ -n "$OLD_PID" ] && ps -p "$OLD_PID" > /dev/null 2>&1; then
                    echo "Arrêt de l'ancien serveur (PID=$OLD_PID)"
                     kill "$OLD_PID" || true
                    sleep 1
                    fi
                    rm -f "$SERVER_PID"
                fi

                echo "Lancement: node $SERVER_SCRIPT (PORT=$LOCAL_PORT)"
                PORT=$LOCAL_PORT nohup node "$SERVER_SCRIPT" > "$SERVER_LOG" 2>&1 & echo $! > "$SERVER_PID"
                echo "Serveur démarré. PID=$(cat "$SERVER_PID")"
                '''
            }
        }*/

        /*stage('Health Check') {
            steps {
                echo 'Vérification de santé de l\'application...'
                script {
                    try {
                        sh '''
                            echo "Test de connectivité..."
                            # Simulation d'un health check
                            echo "Application déployée avec succès"
                        '''
                    } catch (Exception e) {
                        currentBuild.result = 'UNSTABLE'
                        echo "Warning: Health check failed: ${e.getMessage()}"
                    }
                }
            }
        }*/

        stage('Health Check') {
            steps {
                script {
                    try {
                        sh 'curl -fsS "http://127.0.0.1:${LOCAL_PORT}/health" | tee health.json'
                        echo "Application accessible en local ✅"
                    } catch (Exception e) {
                        currentBuild.result = 'UNSTABLE'
                        echo "Warning: Health check failed: ${e.getMessage()}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Nettoyage des ressources temporaires...'
            sh '''
                rm -rf node_modules/.cache
                rm -rf staging
            '''
        }
        success {
            echo 'Pipeline exécuté avec succès!'
            emailext (
                subject: "Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    Le déploiement de ${env.JOB_NAME} s'est terminé avec succès.

                    Build: ${env.BUILD_NUMBER}
                    Branch: ${env.BRANCH_NAME}

                    Voir les détails: ${env.BUILD_URL}
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo 'Le pipeline a échoué!'
            emailext (
                subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    Le déploiement de ${env.JOB_NAME} a échoué.

                    Build: ${env.BUILD_NUMBER}
                    Branch: ${env.BRANCH_NAME}

                    Voir les détails: ${env.BUILD_URL}
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        unstable {
            echo 'Build instable - des avertissements ont été détectés'
        }
    }
}