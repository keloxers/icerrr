/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.rejh.icerrr.itson;

import org.apache.cordova.Config;
import org.apache.cordova.DroidGap;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.WebView;

public class Icerrr extends DroidGap
{
    
	final static String APPTAG = "Icerrr";
	
	private boolean newIntentSent = false;
    
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
    	
        super.onCreate(savedInstanceState);
        
        // Clear cache
        super.clearCache();
        super.appView.getSettings().setAllowFileAccess(true);
        
        // Set by <content src="index.html" /> in config.xml
        super.setStringProperty("url", null); 
        super.setStringProperty("errorUrl",null); 
        super.loadUrl(Config.getStartUrl());
        
        //super.loadUrl("file:///android_asset/www/index.html")
        if(Build.VERSION.SDK_INT >= 19) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        
        IntentFilter filter = new IntentFilter();
        filter.addAction("com.rejh.icerrr.droidapp.actions.KILL_APP");
        registerReceiver(killAppReceiver, filter);
        
        // Call onNewIntent when app is not started before..
        onNewIntent(getIntent());
        
    }
    
    @Override
    public void onStart() {
        Log.d(APPTAG,APPTAG +".onStart()");
    	super.onStart();
    	// Intent incomingIntent = getIntent();
    }
    
    @Override
    public void onResume() {
        Log.d(APPTAG,APPTAG +".onResume()");
        super.onResume();
        Intent incomingIntent = getIntent(); 
    	super.sendJavascript("setTimeout(function() { site.lifecycle.onNewIntent('" + incomingIntent.getDataString() + "'); },1);");
    }
    
    @Override
    public void onNewIntent(Intent newIntent) {
        Log.d(APPTAG,APPTAG +".onNewIntent()");
    	super.onNewIntent(newIntent);
    	setIntent(newIntent);
    	newIntentSent = false;
    	// super.sendJavascript("setTimeout(function() { site.lifecycle.onNewIntent('" + newIntent.getDataString() + "'); },1);");
    }
    
    @Override
    public void onDestroy() {
    	super.onDestroy();
    	unregisterReceiver(killAppReceiver);
    }
    
    // --------------------------------------
    // Keys
    
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {

        //If volume down key
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            super.loadUrl("javascript:cordova.fireDocumentEvent('volumedownbutton');");
            return true;
        } else if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            super.loadUrl("javascript:cordova.fireDocumentEvent('volumeupbutton');");
            return true;
        } else {
            //return super.onKeyDown(keyCode, event); 
        }
        //return super.onKeyDown(keyCode, event);

        return true;
    }
    /**/
    
    // --------------------------------------
    // Others
    
    BroadcastReceiver killAppReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            finish();
        }
    };
    
}

