"use client";

const Marquee = ({ products, currentIndex }) => {
    
  if (!products || products.length === 0) {
    return null; // No renderizar nada si no hay productos
  }

  const product = products[currentIndex]; // Producto actual
  

  return (
    <div className="marquee">
      <div className="flex justify-center items-center gap-4">
        {product.img && (
          <img
            src={product.img}
            alt={product.name}
            className="sm:w-[100px] sm:h-[100px] w-[40px] h-[40px] object-cover rounded"
          />
        )}
        <div className="product-details">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="md:text-base text-xs font-bold"
          >
            {product.name}
          </a>
          <p className="product-price text-gray-300">{product.price}</p>
        </div>
      </div>

      <style jsx>{`
        .marquee {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 90%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          padding: 10px 20px;
          border-radius: 10px;
          z-index: 2;
        }
        .product-price {
          color: #ccc;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Marquee;
