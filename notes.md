## 2023-07-26

In order to match the way I've been structuring task, I'm going to need them to have a bunch of shared information, like the task's name and current status, stored in a register. But on each day where that task sits, it needs to be able to override information that changes over time, such as its status. And notes should also be associated with a day.

---

I'm going to need a register of days as well, so I can find the day object that a task lives against when updating its status.

---

I've got very simple updating working where I can click a status icon and have it update in place. It's very rough though. For example, doing this completely re-renders all the HTML, which has some nasty side effects like losing the position of the keyboard focus. I'm going to need to think of a way to clean up that rendering somehow.

## 2023-07-27

I started looking into a few libraries last night, but in the end I've done what's probably inevitable and gone with web components. Always love using native APIs, and I'm sure I can make this work.

I've got a very simple custom element set up. Realised I can use the light DOM with no problems at all, so that's the approach I'm taking, since I don't think I need the extra encapsulation of the shadow DOM for a lot of this stuff anyway.

My current problem is that my test data isn't getting created until after the element has been initialised. For now I'm just going to move the test data creation into the register code itself, but I'm going to need to come up with some way to signal changes to the app data so these web components can update themselves based on it.

There are two problems I'm going to need to resolve when using web components:

1. All information is provided to them through HTML attributes, so I can only use strings.

2. I will need to develop my own way for keeping them in sync with changes to the underlying data model.

Thankfully, the day and task registers give me a nice way to look up data when I only have a string reference. However, the `TaskReference` structure I had been using won't work anymore. Instead, I'm going to need to store all notes a task has against that task itself, referred against the relevant day.

Likewise, statuses will need to be tracked in the same sort of way.

I think I'm going to want to turn `Task` into a class, in order to handle some internal logic like getting the status on a particular day, and getting notes for a particular day. That means I'm going to need to also develop serialisation and deserialisation routines for it.

Argh okay I think I need to rethink my whole data structure actually. I'm no longer sure that a dayRegister makes sense, now that each task manages its own status and notes. Let me write down what's important to me:

- I like to display the events of each day, including optional notes for a day (e.g. if I wasn't working because I was on sick leave)
- The primary structure of a day is a nested list of tasks. Each task has one status at a time.
- Tasks can have sub-tasks. When this happens, the root task's status depends on the statuses of its sub-tasks.
- Each new day, I copy all the tasks from the previous day except for the ones that reached a completed status.
- I also keep notes each day, which are typically linked to a task. These notes are often lengthy, so I don't display them all at the same time as the task list. Rather, I swap to a different view to see notes for a particular task.
- I find it useful to search my notes. Including when I don't know what task a note was against, or when I made it. But when I find it, I like to know what task and day it's linked to.
- I like to keep track of the status changes a large task went through in a day. For example, if it progressed from in progress, to having a PR, to being approved.
- I have a few different categories of tasks. For example, PRs to review.
- Tasks that have their own notes can also have metadata associated with them. Primarily a branch name, PR number, ticket link, and design link

Having thought about that, I think I can split the tasks I keep track of into two categories:

1. **Project**: Projects have subtasks, notes, and more complex statuses. Anything that gets its own PR is a project.
2. **Task**: Tasks are simple. They have a name, status, and may have subtasks. Tasks may or may not belong to a project. Tasks do not have their own notes.

I also split my tasks into sections. Sections may contain projects and tasks at the root level. Examples of sections are "PRs to review" and "Calendar Alpha".

Let's try a little sketch:

```typescript
// Some days just have a note against them
type Note = string;

type Section = {
	name: string;
	items: Array<Project | Task>;
};

type Project = {
	name: string;
	tasks: Array<Task>;
	// Projects can have different statuses on different days, and sometimes I want to track all status that occur throughout a day
	status: string; // Determined by the status of child tasks
	// Project notes are linked to days. Notes for a day can have a brief summary to help with scanning
	notes: string;
};

type Task = {
	name: string;
	// Tasks can have different statuses on different days
	status: string; // If there are children, this is determined by the status of child tasks
	// A task's subtasks may be different on different days, such as if the day was before it was created, or after it was completed
	tasks?: Array<Task>;
};
```

Okay, I've had a walk and a think, and here's the order in which I think I should implement things:

1. Days can have a note

2. Days can have sections.

3. Sections can have tasks.
	Tasks have a name that always stays the same
	Task have a status that changes on different days
	Tasks don't display before their start date
	Tasks don't display after their completion date

4. Sections can have a start or end date
	If a section has a start date, it doesn't display on days before that
	If a section has an end date, it doesn't display on days after that

5. Tasks can have subtasks
	A task with subtasks doesn't control its own status
		A task's status for a day depends only on subtasks displayed on that day
		If all subtasks are unstarted, a task is unstarted
		If all subtasks are complete, a task is complete
		If one or more subtasks is in progress or complete, a task is in progress

6. Sections can have projects
	Projects have a name that always stays the same
	Projects can have a branch that always stays the same
	Projects can have a PR number that always stays the same
	Projects can have associated links that always stay the same
	Projects don't display before their start date
	Projects don't display after their completion date

7. Projects have a status that changes on different days
	Projects can have multiple, ordered statuses for a given day

8. Projects can have notes
	Notes are related to a given day
	Notes can have a brief summary

---

A problem with this plan is I've never planned in any interactivity. So I'm going to try that early, with just allowing days' notes to be updated. I'm definitely going to need a plan for noticing when information changes, so I can make the UI react to that.

My first instinct is to use a publish/subscribe mechanism. But that gets into annoying typing issues pretty quickly. Better to expose functions that can take listeners, similar to `addEventListener`. I'll need to make sure to clean them up when my components are unmounted.

Okay, I've got something working now. It uses `onDayNoteUpdate` and `offDayNoteUpdate` functions to bind and unbind a callback when the web component is connected and disconnected. I store a reference to the element that needs to stay updated, and update it in that callback.

Because I need to be able to unbind the callback, it gets set up in the constructor to keep a stable reference to it. That means the callback needs to include a couple of checks, e.g. that the element is currently connected. Instead of retrieving the day name from the attribute within the callback, I've also stored it when connected. But that means I should add a lifecycle method to update things when the attribute changes.

I've also made the day element watch its "day" attribute so it can be updated automatically when it changes. But now I'm running into a different problem. I'm effectively having to write the rendering code twice - once during the connection and once during the update function.

I wonder if perhaps I should maintain a reference to the internal DOM structure regardless of if the element is connected or not. That way, I can call a `render()` function both when it's connected and when it's updated.

I can't help but notice that earlier today I was considering using Preact so I wouldn't have to build my own rendering framework. But now I've spent the whole evening trying to build my own rendering framework.

This was a nice little exercise, but it's going to result in this remaining a WIP forever. Next time I work on this, I should look at pulling in Preact. I think I liked the look of it the most. Hopefully it won't be too difficult to incorporate into my build system, since of course it uses JSX.

## 2023-07-29

Okay, I've returned after not looking at this for a little bit, and this time I've dived straight into Preact.

I'm quite happy to see that they've suggested an alternative to JSX, that uses template literals. It adds another dependency, the [`htm`](https://github.com/developit/htm) package, but I'm okay with that. Apparently if I update my build system to use a particular `babel-plugin-htm` plugin for Babel (which I'm sure works with Webpack) that will completely remove all traces of this package from the resulting bundle so it won't even add any size, but even without that it's still under 1kB apparently so I don't mind using it too much.

In order to write using this, I need to write code like this:

```typescript
import { h } from 'preact';
import htm from 'htm';

// Initialise htm with Preact
const html = htm.bind(h);

export function Component() {
	return html`<div>
		<p>JSX-like code can go here</p>
	</div>`;
}
```

That package also recommends a `lit-html` plugin for VS Code, which adds syntax highlighting to these template literals. Very nice.

A notable downside, however, is that it doesn't hook into TypeScript as well. Not *nearly* as well, since it's still technically building strings. I'll see if this becomes enough of a killer for me to try to add JSX compilation to my build step.

And now, of course, I'm rethinking my data structure too. But this is the right time to do it.

Because my first loop is going through all days with information, I think it makes sense to store that information as a list of days. Ideally, minimal information will be stored against days. Most of that information will relate to tasks, and they can be linked via a simple numeric ID.

Thinking ahead, the main complexities I expect to find are going to relate to task statuses. Each day can list the status of a task that was relevant to that day, but tasks also have a current status. That alone isn't too difficult, but the trick may be in knowing when the task's current status should be updated. I guess that won't be too hard, since when updating its status for a day I should be able to then check if any later days exist, and if they do if any of them list a status for this task. Only if none do, will I update the current status.

Okay, so the data structure will be a paired list of days and tasks, something roughly like this:

```typescript
type Day = {
	date: string; // yyyy-MM-dd
	note: string;
	tasks: Array<{
		id: number;
		note: string;
		status: TaskStatus;
	}>;
};

type Task = {
	id: number;
	name: string;
	status: TaskStatus;

	parent: number | null;
	children: Array<number>;
};
```

---

Okay, I've got a simple layout going and the rendering stuff is all working nicely. I've set up both event binding interfaces and custom hooks to use those interfaces within Preact.

Though I did notice a slight oddity I've never run into before, regarding the difference between `useEffect` and `useLayoutEffect`. If I synchronously populate my data *after* rendering, then the rendering will fire before the `useEffect` and so it won't see the updated data. This is only really a problem on the first run, since that `useEffect` is when the event listeners get added. But `useLayoutEffect` doesn't wait for the browser paint to be complete before running, so it can be used synchronously.

Huh... funnily enough, I think those custom hooks are exactly what I needed to create just to get this working with web components anyway? Though I shouldn't go back down that route... knowing when to re-render is not the whole battle. There's also the matter of knowing *how* to re-render, and that's a huge can of worms I don't want to open right now. Not if I want to ever actually use this project.

---

Okay, where I'm leaving it for tonight we have:

☑️ Display a list of days
☑️ Days can have notes
☑️ Days can have sections
☑️ Display a list of unfinished tasks
☑️ Can add new tasks through the UI
☑️ UI updates automatically on changes to day or task data

Tasks can't yet belong to sections, or be edited. Days' notes and sections also can't be edited via the UI, I'm just creating some static test data when the page loads.

## 2023-07-30

I'm going to try to get the notes perfect first. And that means I need to make them addable and editable.

I've pulled in a new dependency for converting markdown into HTML, called `marked`, but in trying to use it I think I've found that the `htm` library that uses tagged template literals as an alternative to JSX doesn't seem to have any way to set HTML via a string. I wonder if using `hasLayoutEffect` with a ref will allow me to do that.

Okay, yeah, that did work at least.

---

Next I want to make it so the current day always has a section where things can be added, even if it doesn't have data yet, and then I'll allow previous days to be created if notes etc. need to be back-filled.

Because the day data is always retrieved from the register, I'm going to add today in there. But I guess that means I should also clean up data when persisting it, so days with no information don't get saved.

Okay, that was easy enough. Now I should add the ability to remove days as well, so once I add persistence I can clean up after myself.

Okay, now I can look at persistence.

Right, I've addded a simple persistence layer. I also started using `ts-toolbox` since I'd pulled in way too many exports from it. I wanted to start using them for the `isDay` typeguard that I need in order to verify JSON data.

---

Once I have a truly asynchronous persistence layer, I'm going to need to handle loading states. I think in order to do this I'm going to need to change the way I'm exposing data to my components.

There are a few ways of doing this, and of course I'm thinking about how I've handled things in the Timely calendar rebuild when I think about this. In particular, the pattern used by Timely's `useFetch` custom hook, where it exports not just data but also information about the state of a pending request, might work quite well here.

So, for example, instead of this:

```typescript
const daysList = useDaysList();
//
const day = useDay(dayName);
```

I might end up using something like this:

```typescript
const {
	data: daysList,
	isLoading: isDaysListLoading,
	error: daysListError,
} = useDaysList();
//
const {
	data: day,
	isLoading: isDayLoading,
	error: dayError,
} = useDay(dayName);
```

This would let me components automatically update to reflect loading states, or if there was some error that needs to be handled in a particular way.

To have a consistent pattern like this, I suspect it will help for me to create a similar intermediary custom hook analogous to `useFetch`. Perhaps `useAsyncData`.

Hmm, but what I also need to consider is that the asynchronous interface is not what I typically use for accessing the data. After all, once it's loaded I should just use the version of it that's loaded into memory.

In the calendar, there are several points where I need to request new data, and the root component handles both the request and adding them to the local copy, which is accessed differently. That makes sense there since I'm not fetching all the data at once, instead fetching it in bits and pieces that I'm keeping track of. Whereas in this case, at least to start with, I only plan on fetching it all at once.

I suppose I could handle this within the custom hooks that will wrap `useAsyncData`, and get them to decide whether to return the local copy or request a new one.

I think my attempt at this has gone awry somewhere. Doesn't help that I've developed quite a headache that's only gotten worse by someone loudly mowing their lawns. I'm going to abandon my changes from this session.

## 2023-08-01

Okay, I'm taking another look at things tonight. At least, that's the plan.

Having thought about how my data model is set up currently, I've decided I don't like it so much. I'd rather there be a single point where the data is fetched - i.e. in the root component - and then each relevant piece of data should be passed down to sub-components.

Perhaps this would even be a good opportunity for me to learn about `useContext`. Okay, I've just read up on it a bit, and it works in pretty much exactly the way I thought it did. I remember the problem I've had with it before is that it can be hard to find where a context was set, in order to see where a particular value is coming from. I think part of the issue I had there in the Timely app was that parts of the code were using a pattern like this:

```tsx
const Context = useContext({} as IContext);
```

I assume this was done in order to ensure the properties didn't have to be typed as nullable, or something?

The more I think about it, the less I think context is relevant here. I don't need all nested elements to know about all days/tasks/etc. all the time, so I think I'll be fine passing down data as I need it. So my first task is to refactor `useDaysList` and `useDay` to a single `useDays` interface that provides data for all days.

Okay, that's working. And now that I'm no longer using the other listeners or hooks I've removed them. I can always add them back later if I need to.

Next, I'm going make the same change for tasks, and let the `OrangeTwist` component itself get the list of unfinished tasks.

Okay, that's done. Now I guess I can try to implement `useAsyncData` again, and then update `useDays` and `useTasks` to wrap that up.

Okay, hmm, perhaps this is not what I was thinking of. I still want `useDays` and `useTasks` to not know or care about the persistence, but I need to change how they're initialised. Or do I? Hmm...

At the moment, I'm loading both bits of data automatically when I initialise the registers. That seems reasonable to me, but it means the loading state isn't communicated. I think I need a break.

## 2023-08-05

I was having a think about this in the shower. I can refactor `useDays` and `useTasks` to return an object like this, and handle the request internally:

```typescript
interface AsyncDataState<T> {
	isLoading: boolean;
	response: T | null;
	error: string | null;
}
```

In order to turn things into custom hooks, I've needed to set up event listeners. So, in order to allow a custom hook to tell when data has been loaded, I'm going to need to set up event listeners for when that data is loaded.

Hmm. Okay, I've got the days data being passed down once it's loaded, but it's only passed down a single time. So I guess I still need that `useEffect` part.

Okay, now I've got it working. I also had to change things a little to make sure the initial data is all loaded at once instead of in successive renders, due to trying to add in today first and that causing some listeners to get fired when really they shouldn't be.

Next I want to get tasks working the same way. Once this complexity is out of the way, I think the next few things will hopefully be much easier.

Okay, I have tasks working the same day now. But things still aren't quite as seamless as I'd like. Because I'm using a `useEffect` to forward the data on (via a `useState` setter), there is an extra render involved when the data gets set whereas the loading state is updated immediately.

This is causing (on my laptop) about a 60ms delay where the loading state has been set to `false` but the data is still `null`.

Okay, I've found how I can resolve this. I want to return the `days` or `tasks` object that I'm using to override the `data` coming from `useAsyncData` once the registers have been updated. But initially, before that is ready, I should still expose `data` directly. So I just change what I return to, for example, `days ?? data`. This means as soon as my `isLoading` is turned to `false`, my data is available. And it will be overridden once I start updating things.

Okay yeah, perfect, this has removed that additional re-render.

I'm still necessarily getting an initial flash of `null` data, but this is a necessary cost of having an asynchronous interface I think. If I knew my `Promise` resolves synchronously, then sure I could initialise my `useState` variable with the initial data. But I don't know that, so I can't. So there's a second round of rendering when the `Promise` is resolved.

I've reduced the number of initial renders by initialising `isLoading` to `true` instead of `false`, since it was immediately getting set to `true` in a `useEffect` and that was causing a re-render. So now we have two initial renders - loading state and then the data being made available.

---

Okay, my persistence stuff is done. Next I want to be able to modify a task. Currently I have a component for a day, but not for tasks, so I'm going to make one.

---

I'm rethinking my data schema a bit, again. I'm no longer convinced that "sections" is the right way to think about attaching tasks to days.

I do want a history linked to tasks, in that I want to be able to look at an entry for a day and see what tasks were worked on during that day and where they ended up. For example, if I completed a task on that day, or if I worked on it but it was still in progress at the end of the day.

So that means I need a way to link a status to a combination of a day and a task, rather than tasks only having a current status. The right way to do this is what I think I've struggled with for a while.

There are a couple of ways I think I could do this. Days could have a list of tasks with associated changes, where the task is linked via its ID. Or tasks could have a list of days with associated changes, where the day is linked via its `dayName`.

I don't really know how to tell which is best. I guess in order to make it easiest for me to display data in the way I want, the information should be linked directly to the day.

Okay, I have days now able to have task information associated with them. When I update a task's status, it gets added to the current day. Likewise, if a task exists on prior days I can update its status for that day. Currently, no matter which day I update a task's status on, its current status will also be updated, and there is no way for me to add tasks to previous days through the UI.

## 2023-08-26

It's been a while. Where was I?

Okay. Days have notes and references to tasks with day-specific statuses. Tasks have names, statuses, and a tree structure. The UI loads persisted data, and requires manual saving. Days can be added and removed in the UI. Days' notes can be edited in the UI. Tasks can be added and edited (name and status) in the UI.

Tasks become linked with days only when their status is updated from the "Tasks" section, at which point they're added to the current day.

I'm currently using my `ts-toolbox` stuff for typeguards, but I'd like to try using Zod.`

Cool, that was pretty easy. Zod does validation in a slightly different way to what I usually do, since it also supports being able to transform a value while validating it. But it's easy enough to transform into a regular typeguard like this:

```typescript
export const isMyType = (value: unknown): value is MyType => myTypeSchema.safeParse(value).success;
```
