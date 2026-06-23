"use client";
import { motion, Variants } from "framer-motion";

import HomeBanner from "@/components/landing/HomeBanner";
import { Container } from "@/components/MainLayout/Container";
import HomeCategoryTabBar from "@/components/landing/HomeCategoryTabBar";
import ProductsOnSale from "@/components/landing/ProductsOnSale";
import NewProducts from "@/components/landing/NewProducts";
import BestSell from "@/components/landing/BestSell";
import TopBrand from "@/components/landing/TopBrand";
import FooterTop from "@/components/MainLayout/Footer/FooterTop";
import OurBlogs from "@/components/landing/OurBlogs";

/* ================= ANIMATIONS ================= */

const fadeSoftUp: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const staggerSoft: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/* ================= PAGE ================= */

export default function Home() {
  return (
    <Container>
      {/* Banner */}
      <motion.div variants={fadeSoftUp} animate="show">
        <HomeBanner />
      </motion.div>

      {/* Main sections */}
      <motion.div
        className="space-y-16 md:space-y-24 mt-16 md:mt-24 mb-16"
        variants={staggerSoft}
        animate="show"
        viewport={{ once: true, margin: "-120px" }}
      >
        <motion.div variants={fadeSoftUp}>
          <HomeCategoryTabBar />
        </motion.div>

        <motion.div variants={fadeSoftUp}>
          <ProductsOnSale />
        </motion.div>

        <motion.div variants={fadeSoftUp}>
          <NewProducts />
        </motion.div>

        <motion.div variants={fadeSoftUp}>
          <BestSell />
        </motion.div>

        <motion.div variants={fadeSoftUp}>
          <TopBrand />
        </motion.div>

        <motion.div variants={fadeSoftUp}>
          <OurBlogs />
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={fadeSoftUp} whileInView="show">
        <FooterTop />
      </motion.div>
    </Container>
  );
}
