import { motion } from "framer-motion";
import vinyl from "../../../assets/vinyl.png";

function Vinyl() {
  return (
    <motion.img
      src={vinyl}
      alt="Vinyl Record"
      animate={{ rotate: 360 }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      className="
        h-[290px]
        w-[290px]
        pointer-events-none
        select-none
        drop-shadow-[0_0_80px_rgba(139,92,246,0.35)]
      "
    />
  );
}

export default Vinyl;