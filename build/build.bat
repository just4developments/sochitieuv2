cordova build --release android
cd ./platforms/android/build/outputs/apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../build/test.keystore android-release-unsigned.apk application
zipalign -v 4 android-release-unsigned.apk android-release.apk
move ./android-release.apk ../../../../../build/