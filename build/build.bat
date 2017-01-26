echo off
ionic build android --prod --release
cd ./platforms/android/build/outputs/apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../build/just4developments.keystore android-armv7-release-unsigned.apk application
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../build/just4developments.keystore android-x86-release-unsigned.apk application
zipalign -v 4 android-armv7-release-unsigned.apk android-armv7-release-signed.apk
zipalign -v 4 android-x86-release-unsigned.apk android-x86-release-signed.apk
move ./android-armv7-release-signed.apk ../../../../../build/sochitieuv2-armv7.apk
move ./android-x86-release-signed.apk ../../../../../build/sochitieuv2-x86.apk
cd ../../../../../


#ionic build android --prod --release --keystore ./just4developments.keystore --keypass 