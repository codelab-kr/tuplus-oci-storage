node {
    def app

     stage('Clone repository') {
         checkout scm
         sh 'git submodule update --init --recursive'
     }

     stage('Build image') {
         app = docker.build("ap-seoul-1.ocir.io/cnqphqevfxnp/oci-storage")
     }

    stage('Test image') {
        app.inside {
            sh 'echo "Tests passed"'
        }
    }

     stage('Push image') {
         docker.withRegistry('https://ap-seoul-1.ocir.io', 'ocir') {
             app.push("${env.BUILD_NUMBER}")
         }
     }

     stage('Trigger ManifestUpdate') { 
        echo "triggering tuplus-update-manifest job"
        build job: 'tuplus-update-manifest', parameters: [
            string(name: 'DOCKERTAG', value: env.BUILD_NUMBER),
            string(name: 'SERVICE', value: 'oci-storage')
        ]
     }
}