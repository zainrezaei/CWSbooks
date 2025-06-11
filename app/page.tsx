import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import BookPreview from "./components/BookPreview/BookPreview";
import Stats from "./components/Stats/Stats";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <BookPreview 
        bookId="1"
        chapterTitle="Foreword"
        content={`In the name of the Almighty

Dear reader,

I write this from my study, a place where countless stories have been born. But this story is different. It began not with imagination, but with a real encounter that changed everything.

It was winter, one of those cold days when hope seems as distant as the spring. A young person walked into my office, eighteen years old, at that age when one should be full of dreams, but their eyes seemed to have lived a hundred years.

"I want to change, but I don't know where to start. Everyone says to leave, to escape. But I want to stay and build. Am I crazy?"

In those eyes, I saw myself. The same confusion, the same fear, the same hope.

This book is for every person who has stood at the crossroads of life, wondering which path to take. It's for those who believe that geography determines destiny, and for those brave enough to question that belief.

Through these pages, you'll discover that the journey from limitation to liberation doesn't require a plane ticket or a new address. The most profound journeys happen within, in the landscape of our thoughts and the territory of our beliefs.

What you're about to read isn't just my story or the story of that young visitor. It's a mirror in which you might see your own reflection, your own struggles, and most importantly, your own potential.

The question isn't "From here to where?" The question is "From who I am to who I can become?"

Let's begin this journey together.`}
        isPreview={true}
      />
      <Stats />
    </main>
  );
}