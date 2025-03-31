import MeetingTypeList from "@/components/MeetingTypeList";
import Clock from "@/components/Clock";

const Home = () => {
  const now = new Date();

  return (
    <section className="flex size-full flex-col gap-7 text-white">
      <div className="h-[300px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-end px-5 py-8">
          {/* <h2 className="glassmorphism max-w-[270px] rounded py-2 text-center text-base font-normal">
            Upcoming meeting at 12:30 PM
          </h2> */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">
              <Clock variant="time" initial={now.getTime()} />
            </h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">
              <Clock variant="day" initial={now.getTime()} />
            </p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
