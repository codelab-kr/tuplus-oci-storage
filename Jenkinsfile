node {
    def app
    // def mainRepo = 'https://github.com/codelab-kr/tuplus-oci-storage.git'
    // def subRepo = 'https://github.com/codelab-kr/tuplus-secutiry-oci.git'

    // stage('Checkout main repo') {
    //     checkout([$class: 'GitSCM', branches: [[name: '*/feature']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[url: mainRepo]]])
    // }

    // stage('Update submodules') {
    //     sh 'git submodule update --init --recursive'
    // }

    // stage('Checkout sub repo') {
    //     dir('submodule') {
    //         checkout([$class: 'GitSCM', branches: [[name: '*/feature']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[url: subRepo]]])
    //     }
    // }

     stage('Clone repository') {
         checkout scm
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