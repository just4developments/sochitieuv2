echo off
ionic build android --prod --release
cd ../platforms/android/build/outputs/apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../build/just4developments.keystore android-release-unsigned.apk application
zipalign -v 4 android-release-unsigned.apk android-release.apk
move ./android-release.apk ../../../../../build/sochitieuv2.apk
cd ../../../../../