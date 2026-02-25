import React from 'react';
import Layout from '../components/common/Layout';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import ProductsSection from '../components/home/ProductsSection';

const Home = () => {
  return (
    <Layout
      title="ShopEase - Your Ultimate Shopping Destination"
      description="Discover amazing products at great prices. Shop electronics, clothing, home goods and more with fast shipping and excellent customer service."
      keywords="ecommerce, shopping, electronics, clothing, home goods, online store"
    >
      <HeroSection />
      <FeaturedProducts />
      <ProductsSection />
    </Layout>
  );
};

export default Home;