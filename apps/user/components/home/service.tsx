import Card from "../ui/Card";
import Image from "next/image";

type ServiceCardProps = {
  title: string;
  desc: string;
  img: string;
};

const services: ServiceCardProps[] = [
  {
    title: "Flower Design",
    desc: "Flower design is important in events because it enhances the whole mood and beauty of the location.",
    img: "/flower.png",
  },
  {
    title: "Event Coordination",
    desc: "Flower design is important in events because it enhances the whole mood and beauty of the location.",
    img: "/ring.png",
  },
  {
    title: "Photoshoot",
    desc: "Flower design is important in events because it enhances the whole mood and beauty of the location.",
    img: "/photoshot.png",
  },
  {
    title: "Makeup Artist",
    desc: "Flower design is important in events because it enhances the whole mood and beauty of the location.",
    img: "/makeup.png",
  },
  {
    title: "Invitations",
    desc: "Flower design is important in events because it enhances the whole mood and beauty of the location.",
    img: "/invitation.png",
  },
  {
    title: "The Spice Route",
    desc: "Flower design is important in events because it enhances the whole mood and beauty of the location.",
    img: "/spice.png",
  },
];

export const Service = () => {
  return (
    <section className="py-16 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
        {services.map((item, i) => (
          <Card className="text-center flex flex-col items-center px-4" key={i}>
            <Image
              src={item.img}
              alt={item.title}
              width={80}
              height={80}
              className="w-[80px] h-[80px] object-contain mb-4"
            />
            <h3 className="text-lg font-medium mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3 max-w-[280px]">
              {item.desc}
            </p>
            <button className="text-[#924C2B] font-medium hover:underline">
              Read More →
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
};
