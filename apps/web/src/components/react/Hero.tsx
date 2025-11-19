export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-20 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Your Weight Loss Journey
            <br />
            <span className="text-primary-200">Starts Here</span>
          </h1>
          <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Track your progress, join supportive teams, and achieve your fitness goals with our
            comprehensive weight loss platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Start Free Trial
            </a>
            <a
              href="#features"
              className="btn bg-primary-700 hover:bg-primary-800 border-2 border-white text-lg px-8 py-3"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
