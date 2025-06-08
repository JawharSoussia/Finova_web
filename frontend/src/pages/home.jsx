import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData } from "@/data";

export function Home() {
  let navigate = useNavigate();
  return (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative flex h-screen content-center items-center justify-center pt-16 pb-32"
      >
       
        {/* Left half image */}
  <div className="absolute top-0 left-0 h-full w-1/2 bg-[url('/img/v1.jpg')] bg-cover bg-center opacity-96" />
  
  {/* Right half image (existing) */}
  <div className="absolute top-0 right-0 h-full w-1/2 bg-[url('/img/v2.jpg')] bg-cover bg-center " />
    
        <motion.div
  initial={{ x: -50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 1, delay: 0.5 }}
  className="max-w-lg container relative mr-auto text-left space-y-4 px-8 ml-12 md:ml-20"
>
  <Typography variant="h1" color="white" className="mb-4 font-black leading-tight">
    Finova is your go-to platform for mastering finance.
  </Typography>
  <Typography variant="lead" color="white" className="opacity-80 leading-relaxed">
    We provide educational resources, webinars, and expert insights to help you 
    manage your budget, save wisely, and invest with confidence.
  </Typography>

  {/* Section de téléchargement */}
  <div className="mt-6 flex items-center gap-4 w-full">
    <a 
      href="https://play.google.com/store" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex-1 overflow-hidden rounded-xl shadow-lg hover:scale-105 transition"
    >
      <img src="/img/app-store.png" alt="App store" className="w-full h-auto object-cover" />
    </a>

    <a 
      href="https://www.apple.com/app-store/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex-1 overflow-hidden rounded-xl shadow-lg hover:scale-105 transition"
    >
      <img src="/img/google-play.jpeg" alt="Google play" className="w-full h-auto object-cover" />
    </a>
  </div>
</motion.div>

<motion.div
  initial={{ x: 50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: 0, opacity: 1 }}
  className="lg:block w-1/5 h-full pr-12 z-50 relative"
>
 

</motion.div>


      </motion.div>

      {/* Feature Section */}
      <section className=" mt-10 px-4 pb-20 pt-4">
        <div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ">
          {featuresData.map(({ color, title, icon, description }, index) => (
            <motion.div
            className="border-2 border-purple-800 rounded-lg"
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05  }}
              transition={{ duration: 0.2 }}
            >
              <FeatureCard
                color={color}
                title={title}
                icon={React.createElement(icon, { className: "w-5 h-5 text-white" })}
                description={description}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="px-4 mt-12 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h3" className="mb-2 font-bold pt-10" color="blue-gray">
            Take Control of Your Finances with Finova
          </Typography>
          <Typography className="mb-8 font-normal text-blue-gray-500">
            Stay on top of your spending, investments, and savings with real-time updates.
          </Typography>
             <motion.button onClick={()=>navigate('/FinanceResources')}
              whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
              transition={{ duration: 0.3 }}
              className="px-6 py-3 bg-purple-800 text-white rounded-lg font-bold"
            >
              Read More
            </motion.button >
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="px-4 pt-20 pb-48">
        <div className="container mx-auto">
          <PageTitle section="Our Technologies" heading="Here are our famous characteristics" />
          <div className="mt-24 grid grid-cols-1 gap-12 gap-x-24 md:grid-cols-2 xl:grid-cols-4">
            {teamData.map(({ img, name, position, socials }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <TeamCard
                  img={img}
                  name={name}
                  position={position}
                  socials={
                    <div className="flex items-center gap-2">
                      {socials.map(({ color, name }) => (
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          transition={{ duration: 0.3 }}
                          key={name}
                        >
                          <IconButton color={color} variant="text">
                            <i className={`fa-brands text-xl fa-${name}`} />
                          </IconButton>
                        </motion.div>
                      ))}
                    </div>
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
