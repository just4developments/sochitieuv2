ionic build android --prod --release
cd ./platforms/android/build/outputs/apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../just4developments.keystore android-release-unsigned.apk application
../../../../../zipalign -v 4 android-release-unsigned.apk android-release-signed.apk
move ./android-release-signed.apk ../../../../../output/sochitieuv3.apk
cd ../../../../../



jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../just4developments.keystore android-armv7-release-unsigned.apk application
zipalign -v 4 android-armv7-release-unsigned.apk android-armv7-release-signed.apk
move ./android-armv7-release-signed.apk ../../../../../output/sochitieuv3-armv7.apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../just4developments.keystore android-x86-release-unsigned.apk application
zipalign -v 4 android-x86-release-unsigned.apk android-x86-release-signed.apk
move ./android-x86-release-signed.apk ../../../../../output/sochitieuv3-x86.apk
cd ../../../../../


#ionic build android --prod --release --keystore ./just4developments.keystore --keypass 