import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loading } from './components/Loading';
import './App.css';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Catalog = lazy(() => import('./pages/Catalog').then(m => ({ default: m.Catalog })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(m => ({ default: m.BlogPost })));
const Privacy = lazy(() => import('./pages/Policies').then(m => ({ default: m.Privacy })));
const Exchanges = lazy(() => import('./pages/Policies').then(m => ({ default: m.Exchanges })));
const Shipping = lazy(() => import('./pages/Policies').then(m => ({ default: m.Shipping })));
const Terms = lazy(() => import('./pages/Policies').then(m => ({ default: m.Terms })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loja" element={<Catalog />} />
        <Route path="/sobre-nos" element={<About />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/politica-de-privacidade" element={<Privacy />} />
        <Route path="/trocas-e-devolucoes" element={<Exchanges />} />
        <Route path="/politica-de-envios" element={<Shipping />} />
        <Route path="/termos-e-condicoes" element={<Terms />} />
        <Route path="/produto/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}

export default App;
