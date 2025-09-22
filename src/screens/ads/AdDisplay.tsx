// 📂 File: src/screens/ads/AdDisplay.tsx (FINAL & VERIFIED)

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../api/client';
import TopNotchAd, { Ad } from '../../screens/ads/TopNotchAd'; // Corrected path if needed

const AdDisplay: React.FC = () => {
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAndCycleAd = async () => {
      try {
        const { data: approvedAds } = await apiClient.get<Ad[]>('/ads/display');
        
        if (approvedAds.length === 0) return;

        const lastAdIndexStr = await AsyncStorage.getItem('lastAdIndex');
        const lastAdIndex = lastAdIndexStr ? parseInt(lastAdIndexStr, 10) : -1;
        const nextAdIndex = (lastAdIndex + 1) % approvedAds.length;
        
        await AsyncStorage.setItem('lastAdIndex', nextAdIndex.toString());
        setCurrentAd(approvedAds[nextAdIndex]);
      } catch (error) {
        console.error("AdDisplay Component: Could not fetch ad", error);
      }
    };
    fetchAndCycleAd();
  }, []);

  if (!currentAd) return null;
  
  // Only render ads of type 'top_notch'
  if (currentAd.ad_type === 'top_notch') {
    return <TopNotchAd ad={currentAd} />;
  }
  
  return null;
};

export default AdDisplay;