import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchIndexData } from '../api'; // Համոզվեք, որ ուղին ճիշտ է

// Սահմանում ենք տվյալների տիպերը՝ ավելի կանխատեսելի կոդի համար
interface IndexData {
  lastPost: any;
  lastPosts: any[];
  slidePosts: any[];
  interviews: any[];
  news: any[];
}

interface DataContextType {
  data: IndexData | null;
  loading: boolean;
}

// 1. Ստեղծում ենք Context-ը
const DataContext = createContext<DataContextType | undefined>(undefined);

// 2. Ստեղծում ենք Provider կոմպոնենտը, որը "կփաթեթավորի" մեր հավելվածը
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect-ը կանչվում է մեկ անգամ, երբ հավելվածը բացվում է
  useEffect(() => {
    fetchIndexData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const value = { data, loading };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// 3. Ստեղծում և արտահանում ենք (export) useData hook-ը
// Սա է այն ֆունկցիան, որը ձեր էկրանները կօգտագործեն Context-ի տվյալները ստանալու համար
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};