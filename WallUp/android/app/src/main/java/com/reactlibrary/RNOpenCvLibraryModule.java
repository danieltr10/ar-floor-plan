package com.reactlibrary;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import org.opencv.core.CvType;
import org.opencv.core.Mat;

import org.opencv.android.Utils;
import org.opencv.imgproc.Imgproc;

import android.util.Base64;

public class RNOpenCvLibraryModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNOpenCvLibraryModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNOpenCvLibrary";
    }

    @ReactMethod
    public void checkForBlurryImage(String imageAsBase64, Callback errorCallback, Callback successCallback) {
       try {
           BitmapFactory.Options options = new BitmapFactory.Options();
           options.inDither = true;
           options.inPreferredConfig = Bitmap.Config.ARGB_8888;

           byte[] decodedString = Base64.decode(imageAsBase64, Base64.DEFAULT);
           Bitmap image = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

           int l = CvType.CV_8UC1; //8-bit grey scale image
           Mat matImage = new Mat();
           Utils.bitmapToMat(image, matImage);
           Mat matImageGrey = new Mat();
           Imgproc.cvtColor(matImage, matImageGrey, Imgproc.COLOR_BGR2GRAY);

           Bitmap destImage;
           destImage = Bitmap.createBitmap(image);
           Mat dst2 = new Mat();
           Utils.bitmapToMat(destImage, dst2);

           int maxLap = -16777216; // 16m
           int soglia = -8118750;

           successCallback.invoke(maxLap <= soglia);
       } catch (Exception e) {
           errorCallback.invoke(e.getMessage());
       }
    }
}
