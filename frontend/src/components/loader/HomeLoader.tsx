import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const HomeLoader = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-8 border-none shadow-none bg-transparent">
        <CardContent className="flex items-center justify-center">
          <motion.div
            className="relative w-16 h-16"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Outer glowing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/40"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Inner gradient ring */}
            <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-primary/90 border-r-primary/60 animate-spin" />
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeLoader;

