#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n br.poli.interativo/host.exp.exponent.MainActivity
