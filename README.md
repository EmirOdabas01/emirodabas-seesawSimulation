Seesaw Simulation

My Approach:

I followed the UI-First strategy and created UI elements first. It helped me to focus on logic and understanding of application needs.
Also it improved debugging because when I code something with javascript and something goes wrong, I know the problem is not about CSS or HTML(most of the time). Even with some problems with CSS, I just did minor changings.

And I used absolute and relative CSS properties to work with elements better and create an abstraction.

Limitations:
We have to calculate positions and physics manually without any abstraction layer. Also Pure DOM manipulation is not good enough for our needs. This increases developer responsibilities. Rotating a parent element also affects the children and changes their values.

AI Usage:
I used AI to find the best approach to the project and solution like Stunt Double technique.
I started with UI like I said because with AI's help I knew this wont break anything later on, I can continue without thinking about UI elements that much. And another thing is I had a problem with drop animation. When I added animation, weights dropped with the same angle of plank. Because weights(object) are the child elements of plank and I use plank coordinates to rotate them but plank coordinates change according to angle. This also causes weights coordinates to change and animation goes with an angle not straight. So AI suggested that I use the Double Stunt/ghost method to animate dropping. The idea is focusing on ghost objects that have some features that the original hasn't. They are fixed and the child's body is not plank so we trick the user and show like it's dropping but we actually create real objects right in the plank but we don't show them until the animation finishes. I liked this idea because it provides an abstraction a little bit. Also AI was useful in debugging, showing me the reason if I had a calculation mistake.
