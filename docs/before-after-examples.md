# Before-and-after examples

This file contains candidate examples for the README or other documentation.

Each example shows two recorded answers to the same prompt:

- **Before**: LLM output without the skill.
- **After**: LLM output with the `simplified-technical-english` skill.

Each entry names the harness and the model that produced it.

## How the Claude Code entries were recorded

The Claude Code entries were recorded on 2026-07-31 with Claude Fable 5 (`claude-fable-5`). Two fresh subagents received the same prompt:

- The "before" agent received this added instruction: do not use the `simplified-technical-english` skill or any other skill.
- The "after" agent received this added instruction: invoke the `simplified-technical-english` skill first and follow its guidance.

The prompts contain no word limits and no style instructions. Both agents received the same instruction to return only the requested text.

## How the Codex entries were recorded

The Codex entries were recorded on 2026-07-31 with Codex sub-agents and GPT-5.6 (`gpt-5.6-sol`). Two fresh sub-agents received the same prompt:

- The "before" agent received this added instruction: do not use the `simplified-technical-english` skill or any other skill.
- The "after" agent received this added instruction: invoke the `simplified-technical-english` skill first and follow its guidance.

The prompts contain no word limits and no style instructions. Both agents received the same instruction to return only the requested text and not edit files.

## How the GitHub Copilot CLI entries were recorded

The GitHub Copilot CLI entries were recorded on 2026-07-31 with the `general-purpose` sub-agent and Claude Sonnet 5 (`claude-sonnet-5`). Two fresh sub-agents received the same prompt:

- The "before" agent received this added instruction: do not use the `simplified-technical-english` skill or any other skill, and do not invoke any skill tool at all.
- The "after" agent received this added instruction: invoke the `simplified-technical-english` skill first and follow its guidance.

The prompts contain no word limits and no style instructions. Both agents received the same instruction to return only the requested text.

## How the opencode entries were recorded

The opencode entries were recorded on 2026-07-31 with the `general` sub-agent and DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`). Two fresh sub-agents received the same prompt:

- The "before" agent received this added instruction: do not use the `simplified-technical-english` skill or any other skill, and do not invoke any skill tool.
- The "after" agent received this added instruction: invoke the `simplified-technical-english` skill first and follow its guidance.

The prompts contain no word limits and no style instructions. Both agents received the same instruction to return only the requested text.

## How to add an entry for another model

1. Copy the "Other models" template in the example.
2. Send the prompt to the model without the skill. Record the output as the "before" text.
3. Install the skill, send the same prompt, and record the output as the "after" text.
4. Replace the placeholders with the harness name, the model ID, and the two outputs.

Select the examples that show the value of the skill most clearly. Each entry ends with a list of the observed differences.

---

## Example 1: Library usage guide (IcedTasks)

**Prompt:** Explain how to use https://github.com/TheAngryByrd/IcedTasks and when it's most useful.

### Claude Code — Claude Fable 5 (`claude-fable-5`)

#### Before

> **IcedTasks** is an F# library by TheAngryByrd that adds extra `task`-style computation expressions built on F# 6's resumable code. It fills three gaps in F#'s built-in async story: lazy ("cold") tasks, automatic `CancellationToken` flowing, and `ValueTask` support.
>
> ## Installation
>
> ```bash
> dotnet add package IcedTasks
> ```
>
> Then `open IcedTasks` in your code.
>
> ## The main computation expressions
>
> | Builder | Underlying type | What it gives you |
> |---|---|---|
> | `coldTask` | `unit -> Task<'T>` | A task that doesn't start until you invoke it, and can be re-run |
> | `cancellableTask` | `CancellationToken -> Task<'T>` | Cold + a token flowed automatically through every bind |
> | `cancellableValueTask` | `CancellationToken -> ValueTask<'T>` | Same, but `ValueTask`-based |
> | `valueTask` / `poolingValueTask` | `ValueTask<'T>` | A `ValueTask` CE F# core lacks (pooling variant reduces allocations) |
> | `asyncEx` | `Async<'T>` | An improved `async`: awaits Tasks/ValueTasks directly, `use!` with `IAsyncDisposable`, `for` over `IAsyncEnumerable`, throws the real exception instead of `AggregateException` |
> | `parallelAsync` | `Async<'T>` | Applicative `and!` syntax to run asyncs concurrently |
>
> There are also `IcedTasks.Polyfill.Task` / `Polyfill.Async` namespaces that shadow the built-in `task`/`async` builders with the enhanced versions.
>
> ## Basic usage
>
> **Cold tasks** — unlike a regular `task`, nothing runs until you call it:
>
> ```fsharp
> open IcedTasks
>
> let work = coldTask {
>     printfn "running"
>     return 42
> }
> // nothing has run yet
> let! result = work ()   // starts now; calling again re-runs it
> ```
>
> **Cancellable tasks** — the killer feature. Instead of threading a `CancellationToken` parameter through every function signature, the CE carries it implicitly:
>
> ```fsharp
> let writeJunkToFile path = cancellableTask {
>     let junk = Array.zeroCreate 4096
>     use file = File.Create path
>     for _ in 1 .. 1000 do
>         // bind against CancellationToken -> Task: the CE supplies the token
>         do! fun ct -> file.WriteAsync(junk, 0, junk.Length, ct)
> }
>
> // You can also grab the token explicitly:
> let doWork () = cancellableTask {
>     let! ct = CancellableTask.getCancellationToken ()
>     do! someApi.CallAsync(ct)
> }
>
> // At the edge of your app, supply a real token to execute:
> use cts = new CancellationTokenSource(TimeSpan.FromSeconds 30.)
> do! writeJunkToFile "out.bin" cts.Token
> ```
>
> Nested `cancellableTask`s compose: an outer one binding an inner one passes its token down automatically, and cancellation is checked before every bind — so cooperative cancellation works throughout your call graph without any manual plumbing.
>
> **ValueTask** — useful when interoperating with modern .NET APIs (`IAsyncEnumerable`, `System.IO.Pipelines`, EF Core) that return `ValueTask`:
>
> ```fsharp
> let answer = valueTask { return 42 }
> ```
>
> **Parallel composition with `and!`:**
>
> ```fsharp
> let getData = parallelAsync {
>     let! a = fetch "urlA"
>     and! b = fetch "urlB"
>     and! c = fetch "urlC"
>     return combine a b c
> }
> ```
>
> ## When it's most useful
>
> 1. **Server/library code that must honor cancellation.** This is the primary use case. F#'s `async` flows cancellation implicitly but is slower and awkward with Task-based .NET APIs; `task` is fast but makes you pass `CancellationToken` manually everywhere. `cancellableTask` gives you both: Task performance plus `async`-style implicit cancellation. It's used in real projects like FSAutoComplete (the F# language server) and FsToolkit.ErrorHandling for exactly this reason.
>
> 2. **When you need cold/re-runnable semantics with Task performance** — e.g., retry logic, where a hot `Task` can't be re-executed but a `coldTask` (or `cancellableTask`) can be invoked repeatedly.
>
> 3. **Heavy interop with modern .NET APIs** returning `ValueTask` or `IAsyncEnumerable`, where the `valueTask`/`poolingValueTask` CEs avoid extra `Task` allocations on hot paths.
>
> 4. **Codebases still using `Async` that want smoother Task interop** — `asyncEx` lets you `let!` a `Task` directly, `use!` an `IAsyncDisposable`, and get sane exception behavior without converting everything.
>
> If you're writing a small script or purely hot, fire-once tasks with no cancellation concerns, the built-in `task` CE is fine. Reach for IcedTasks when cancellation plumbing, cold-start semantics, or `ValueTask` allocation pressure start shaping your code.

#### After

> ## What IcedTasks is
>
> IcedTasks is an F# library from TheAngryByrd. It adds computation expressions that extend the standard F# `task` expression. It uses the resumable-code feature of F# 6.0 and newer.
>
> The library gives you these main computation expressions:
>
> - `coldTask` — makes a task with the type `unit -> Task<'T>`. The task does not start until you call it.
> - `cancellableTask` — makes a task with the type `CancellationToken -> Task<'T>`. The token flows through the computation automatically.
> - `cancellableValueTask` — the same as `cancellableTask`, but it returns a `ValueTask<'T>`.
> - `valueTask` and `poolingValueTask` — make a `ValueTask<'T>` directly.
> - `parallelAsync` — runs `Async` values in parallel with the `and!` syntax.
> - `asyncEx` — an improved `Async` builder. It supports `IAsyncDisposable`, `IAsyncEnumerable`, and direct binds against tasks.
>
> ## How to use it
>
> 1. Install the `IcedTasks` package from NuGet.
> 2. Add `open IcedTasks` at the top of your source file.
> 3. Write the applicable computation expression.
>
> ### Example: a cold task
>
> A cold task does not run when you define it. It runs when you call it.
>
> ```fsharp
> let writeGreeting = coldTask {
>     do! File.WriteAllTextAsync("greeting.txt", "hello")
> }
>
> // Nothing has started yet.
> do! writeGreeting () // The task starts here.
> ```
>
> You can call a cold task more than one time. Each call starts a new execution.
>
> ### Example: a cancellable task
>
> A cancellable task moves a `CancellationToken` through each bind. You do not add a token parameter to each function.
>
> ```fsharp
> let writeJunkToFile = cancellableTask {
>     use file = File.Open(path, FileMode.Create)
>     // Bind against a function of type CancellationToken -> Task.
>     do! fun ct -> file.WriteAsync(junk, 0, junk.Length, ct)
> }
>
> // Supply the token one time, at the call site.
> do! writeJunkToFile cts.Token
> ```
>
> The builder examines the token before each bind. A canceled token stops the computation quickly.
>
> ### Example: parallel async
>
> ```fsharp
> parallelAsync {
>     let! plants = exampleHttpCall "howManyPlantsDoIOwn"
>     and! temperature = exampleHttpCall "whatsTheTemperature"
>     return (plants, temperature)
> }
> ```
>
> The `and!` binds start together and run in parallel.
>
> ## When it is most useful
>
> - **You must control when a task starts.** A standard .NET task is hot. It starts immediately. Use `coldTask` when you must delay or repeat the work.
> - **You must support cancellation without extra parameters.** Use `cancellableTask` to move one token through a full call chain. In ASP.NET, pass `httpContext.RequestAborted` at the top level.
> - **You must decrease allocations.** F# does not include a built-in `valueTask` expression. Use `valueTask` or `cancellableValueTask` for hot paths that frequently complete synchronously.
> - **You must run `Async` work in parallel.** Use `parallelAsync` with `and!` to start operations together and await all results.
> - **You must mix `Async` code with modern .NET types.** Use `asyncEx` to bind tasks directly, use `IAsyncDisposable`, and iterate `IAsyncEnumerable` in `Async` code.
>
> In short, use IcedTasks when standard `task` and `async` expressions do not give you cold starts, automatic cancellation, `ValueTask` support, or applicative parallelism.

#### Observed differences

- Long multi-clause sentences became short single-statement sentences. Compare the "before" sentence "Nested `cancellableTask`s compose: an outer one binding an inner one passes its token down automatically, and cancellation is checked before every bind — so cooperative cancellation works throughout your call graph without any manual plumbing." with the "after" sentences "The builder examines the token before each bind. A canceled token stops the computation quickly."
- Opinion phrases were removed: "the killer feature", "optional but wise" style asides, "sane exception behavior".
- Contractions were removed: "doesn't", "can't", "you're", "it's".
- The "when useful" list became direct instructions with the pattern "Use X when you must Y".
- The setup became a numbered procedure.

### Other models

#### Codex — GPT-5.6 (`gpt-5.6-sol`)

##### Before

> IcedTasks is an F# library that provides additional computation expressions for task-based asynchronous programming. It builds on the resumable-code support introduced in F# 6 and is useful when the standard `task` and `async` computation expressions do not provide the execution or cancellation semantics you need.
>
> Install the package from NuGet:
>
> ```bash
> dotnet add package IcedTasks
> ```
>
> Import it in your F# source file:
>
> ```fsharp
> open IcedTasks
> ```
>
> You can then select a computation expression based on the behavior you need.
>
> Use `valueTask` when an operation may complete synchronously and you want to return `ValueTask<'T>`:
>
> ```fsharp
> let getAnswer =
>     valueTask {
>         return 42
>     }
> ```
>
> This can reduce allocations in performance-sensitive code, but `ValueTask` has stricter usage rules than `Task`. It is most appropriate for frequently called library methods where synchronous completion is common and measurements show that task allocation matters.
>
> Use `coldTask` when you want to define asynchronous work without starting it immediately:
>
> ```fsharp
> let getAnswer =
>     coldTask {
>         return 42
>     }
>
> let resultTask = getAnswer ()
> ```
>
> A `ColdTask<'T>` is an alias for `unit -> Task<'T>`. Calling the function starts the operation. This is useful when you need lazy execution, repeatable operations, or behavior similar to F# `Async<'T>` while still using .NET tasks.
>
> Use `cancellableTask` when cancellation should flow through an entire computation:
>
> ```fsharp
> open System.Threading
>
> let getAnswer =
>     cancellableTask {
>         let! cancellationToken =
>             CancellableTask.getCancellationToken ()
>
>         cancellationToken.ThrowIfCancellationRequested()
>         return 42
>     }
>
> let resultTask = getAnswer CancellationToken.None
> ```
>
> A `CancellableTask<'T>` is an alias for `CancellationToken -> Task<'T>`. The builder checks cancellation around binds and lets nested operations access the current token. It is particularly useful in ASP.NET request handling, services, file operations, and other workflows where many asynchronous calls need the same cancellation token.
>
> Use `cancellableValueTask` when you need both cancellation propagation and `ValueTask<'T>`:
>
> ```fsharp
> let getAnswer =
>     cancellableValueTask {
>         return 42
>     }
> ```
>
> Use `parallelAsync` when several independent `Async<'T>` operations should run concurrently:
>
> ```fsharp
> let loadEverything =
>     parallelAsync {
>         let! first = loadFirst ()
>         and! second = loadSecond ()
>         and! third = loadThird ()
>
>         return first, second, third
>     }
> ```
>
> The `and!` bindings start independent operations in parallel and wait for all results. This is useful for concurrent HTTP requests, database queries, and other independent I/O operations.
>
> Use `asyncEx` when you prefer F# `Async<'T>` semantics but need broader interoperability. It supports awaiting `Task`, `ValueTask`, and other awaitable values, using `IAsyncDisposable`, iterating over `IAsyncEnumerable<'T>`, and unwrapping task exceptions without exposing `AggregateException`:
>
> ```fsharp
> let getAnswer =
>     asyncEx {
>         let! value =
>             task {
>                 return 42
>             }
>
>         return value
>     }
> ```
>
> IcedTasks also includes `taskUnit` and `backgroundTaskUnit` for tasks that do not return a value, pooling builders for allocation-sensitive .NET 6 or later code, and polyfills for fixes or capabilities missing from some versions of the standard F# task builder.
>
> IcedTasks is most useful when you need one or more of the following:
>
> - Lazy task execution
> - Reusable task-producing workflows
> - Automatic cancellation-token propagation
> - `ValueTask<'T>` computation expressions
> - Parallel composition of `Async<'T>` values
> - Better interoperability among F# async workflows, .NET tasks, value tasks, async disposables, and async enumerables
> - Task-builder behavior that is unavailable in the F# version targeted by your project
>
> For ordinary asynchronous code, the built-in F# `task` expression is usually sufficient. Use IcedTasks when its explicit execution, cancellation, interoperability, or allocation behavior solves a concrete requirement.

##### After

> ## IcedTasks
>
> IcedTasks adds F# computation expressions for specialized asynchronous workflows.
>
> Install the NuGet package:
>
> ```shell
> dotnet add package IcedTasks
> ```
>
> Open the namespace:
>
> ```fsharp
> open IcedTasks
> ```
>
> Select a builder that matches the required behavior:
>
> | Builder | Use it when |
> |---|---|
> | `valueTask` | The operation often completes synchronously, and measurements show fewer allocations. |
> | `coldTask` | The task must start on demand or run more than once. |
> | `cancellableTask` | The workflow must pass one `CancellationToken` through all operations. |
> | `cancellableValueTask` | The workflow needs cancellation and `ValueTask` behavior. |
> | `parallelAsync` | Independent `Async<'T>` operations must run concurrently. |
> | `asyncEx` | An async workflow must await tasks, dispose asynchronous resources, or process `IAsyncEnumerable<'T>`. |
> | `taskUnit` | A task does not return a value. |
>
> For example, `coldTask` does not start until you call it:
>
> ```fsharp
> open IcedTasks
> open System.IO
>
> let readFile =
>     coldTask {
>         return! File.ReadAllTextAsync("data.txt")
>     }
>
> task {
>     let! text = readFile ()
>     printfn "%s" text
> }
> ```
>
> Use IcedTasks when the standard `task` or `async` expression does not provide the required execution behavior.
>
> Do not select `ValueTask` only because it can reduce allocations. Measure the application because `ValueTask` adds usage restrictions and complexity.

##### Observed differences

- The "after" text uses a table to map each builder to one use case.
- The "after" text removes secondary details and keeps one complete example.
- Long descriptions became short statements or direct instructions.
- The allocation guidance became a direct caution to measure the application.

#### GitHub Copilot CLI — Claude Sonnet 5 (`claude-sonnet-5`)

##### Before

> IcedTasks is most useful when F#'s built-in `task {}` or `async {}` is close, but you need better cancellation flow, lazy/cold tasks, `ValueTask`, or richer async interop.
>
> Use it like this:
>
> ```fsharp
> #r "nuget: IcedTasks"
> open IcedTasks
> ```
>
> Then pick the builder that matches your need:
>
> ```fsharp
> let work =
>     cancellableTask {
>         let! ct = CancellableTask.getCancellationToken ()
>         do! Task.Delay(100, ct)
>         return 42
>     }
> ```
>
> Common choices:
> - `valueTask` / `poolingValueTask`: reduce allocations for fast/hot paths
> - `coldTask`: `unit -> Task<'T>`; work does not start until you call it
> - `cancellableTask`: automatically thread a `CancellationToken`
> - `asyncEx`: async-style workflows with better `Task`/`ValueTask`/`IAsyncEnumerable` interop
> - `parallelAsync`: run multiple `Async` operations in parallel with `and!`
>
> In short: use IcedTasks when you want task-based performance and interop, but still want the nicer control-flow patterns F# developers often like from `async`.

##### After

> Install the `IcedTasks` NuGet package, then `open IcedTasks` in your F# code.
>
> Use the builder that matches your async work:
> - `task` for normal hot `Task<'T>` work
> - `valueTask` when work often finishes synchronously
> - `coldTask` when the caller must start the work later
> - `cancellableTask` or `cancellableValueTask` when cancellation is part of the API
> - `asyncEx` for F# `Async` semantics with better `Task`, `ValueTask`, `IAsyncDisposable`, and `IAsyncEnumerable` interop
> - `parallelAsync` to run multiple `Async<'T>` operations together with `and!`
>
> IcedTasks is most useful when the built-in F# builders do not give the task shape, cancellation flow, or interop behavior that your API needs.

##### Observed differences

- The "before" text closes with a soft summary ("In short: use IcedTasks when you want..."). The "after" text closes with one direct sentence stating the condition for use.
- The "after" text drops the code sample entirely and states install/usage as short instructions instead of a runnable snippet plus narrative.
- Each "after" bullet names one builder and one condition. The "before" bullets mix a builder name with an open-ended description ("richer async interop").

#### opencode — DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`)

##### Before

> IcedTasks is an F# library that adds computation expressions built on F# 6's Resumable Code, covering gaps in the built-in `task` CE. You install the `IcedTasks` NuGet package and `open IcedTasks`, then use the builders directly.
>
> ## How to use it
>
> Each builder produces a distinct type alias:
>
> - `coldTask` → `ColdTask<'T>` = `unit -> Task<'T>` (lazy task; nothing runs until you call it)
> - `cancellableTask` → `CancellableTask<'T>` = `CancellationToken -> Task<'T>` (lazy + token-aware)
> - `valueTask` / `valueTaskUnit` / `poolingValueTask` → `ValueTask<'T>` (cheaper synchronous paths)
> - `cancellableValueTask` → `CancellationToken -> ValueTask<'T>`
> - `parallelAsync` → `ParallelAsync<'T>` (runs `and!` branches concurrently)
> - `asyncEx` → `Async<'T>` with extra features
> - `taskUnit` / `backgroundTaskUnit` → `Task` (no return value)
>
> Typical usage:
>
> ```fsharp
> open IcedTasks
>
> // Lazy: won't run until invoked
> let foo = coldTask { someValue <- 42 }
> do! foo ()
>
> // Cancellable: call with a token
> do! writeJunkToFile cts.Token
>
> // Inside cancellableTask, bind directly to CancellationToken->Task functions
> cancellableTask {
>     do! fun ct -> file.WriteAsync(junk, 0, junk.Length, ct)
> }
>
> // Parallel async
> parallelAsync {
>     let! a = exampleHttpCall "x"
>     and! b = exampleHttpCall "y"
>     return a + b
> }
> ```
>
> You can also use the polyfill builders under `IcedTasks.Polyfill.Task` / `IcedTasks.Polyfill.Async`, which shadow the standard F# CEs with fixed behavior.
>
> ## When it's most useful
>
> - **Lazy task execution** — when you need to decide *when* (or whether) a task starts, re-run it, or defer work like `Async` does. `task`/`async` start eagerly; `coldTask` doesn't.
> - **Cancellation without parameter pollution** — `cancellableTask` flows a `CancellationToken` through the computation, so your functions don't take an explicit token parameter (great for ASP.NET, passing `RequestAborted`).
> - **ValueTask support** — F# has no built-in `valueTask` CE; use it for hot synchronous paths or when interop requires `ValueTask`.
> - **Parallel fan-out** — `parallelAsync` runs `Async` blocks concurrently with `and!`, useful for independent HTTP/IO calls.
> - **`asyncEx`** — when you need F#'s `async` plus `use` on `IAsyncDisposable`, `let!/do!` against any awaitable (`Task`, `ValueTask`, `YieldAwaitable`), `for` over `IAsyncEnumerable`, and unwrapped (non-`AggregateException`) task exceptions.
>
> Choose `cancellableTask` for most cold/cancellable work; add `cancellablePoolingValueTask` or `poolingValueTask` on .NET 6+ when you want pooled allocations. If you just need standard eager tasks, the plain F# `task` CE is fine.

##### After

> ## How to use IcedTasks
>
> IcedTasks is an F# library. It provides computation expressions for asynchronous work. These expressions extend the F# task computation expression.
>
> **To use the library:**
>
> 1. Install the IcedTasks package from NuGet.
> 2. Add `open IcedTasks` to your F# source file.
> 3. Select the builder that matches your task.
>
> **Main builders:**
>
> - `coldTask` starts only when you call it. You can call it again to run it again.
> - `cancellableTask` and `cancellableValueTask` pass a `CancellationToken` through the computation. You can bind directly against a `CancellationToken -> Task<'T>` function.
> - `valueTask` and `poolingValueTask` produce `ValueTask` results.
> - `parallelAsync` runs several `Async` expressions at the same time and waits for all of them.
> - `asyncEx` works like `Async` but handles `IAsyncDisposable`, `Task`, `ValueTask`, and `IAsyncEnumerable`. It unwraps exceptions so you receive the original exception.
> - `taskUnit` models a task that has no return value.
>
> ## When it is most useful
>
> - You want to delay or control when a task starts.
> - You want to run the same task more than once.
> - You want to flow a cancellation token without adding a token parameter to each function.
> - You call .NET APIs that return `ValueTask`.
> - You want several operations to run in parallel and wait for all results.
> - You use `Async` together with modern .NET types such as `IAsyncDisposable` and `IAsyncEnumerable`.

##### Observed differences

- The "after" text states the install and usage steps as a numbered procedure with a prerequisite. The "before" text mixes the install into the opening paragraph.
- The "after" text removes details that the prompt did not ask for, such as the F# 6 resumable-code mechanism and the polyfill builders.
- Long multi-clause sentences became short single-statement sentences.
- The "when useful" list became a set of "You want to..." conditions instead of bolded labels with descriptions.
- The "after" text drops contractions ("won't", "doesn't") and casual asides ("cheaper synchronous paths", "parameter pollution").

#### opencode — nemotron-3-ultra-free (`opencode/nemotron-3-ultra-free`)

##### Before

> **IcedTasks** is an F# library providing additional computation expressions for working with Tasks, ValueTasks, and Async workflows. It runs on .NET 6+ and requires F# 6+ (for resumable code support).
>
> ## Installation
>
> ```bash
> dotnet add package IcedTasks
> ```
>
> ## Main Computation Expressions
>
> | Expression | Type | Use Case |
> |------------|------|----------|
> | `valueTask` / `poolingValueTask` | `ValueTask<'T>` | Better performance for sync-heavy code; pooling variant uses `ValueTask` pooling (.NET 8+) |
> | `coldTask` | `unit -> Task<'T>` | Lazy evaluation — task doesn't start until invoked; re-runnable |
> | `cancellableTask` / `cancellableValueTask` | `CancellationToken -> Task<'T>` | Lazy + built-in cancellation token flow; checks cancellation at every bind |
> | `parallelAsync` | `Async<'T>` | Applicative-style parallel execution of multiple asyncs |
> | `asyncEx` | `Async<'T>` | Enhanced async: supports `IAsyncDisposable`, awaits Tasks/ValueTasks directly, unwraps exceptions (no `AggregateException`), supports `for` over `IAsyncEnumerable` |
> | `task` / `backgroundTask` | `Task<'T>` | Polyfill fixing F# Task CE quirks |
>
> ## When It's Most Useful
>
> 1. **Cold/cancellable workflows** — You want explicit control over when work starts, need re-execution, or want cancellation threaded through without extra parameters
> 2. **Performance-sensitive async** — `ValueTask`/`poolingValueTask` avoid allocations in hot paths
> 3. **Modern async patterns** — Need `IAsyncDisposable`, `IAsyncEnumerable`, or direct Task/ValueTask awaiting in async workflows
> 4. **Parallel async** — Run multiple independent async operations concurrently with applicative syntax
> 5. **Exception handling** — Want Tasks to throw original exceptions instead of wrapped `AggregateException`
>
> ## Quick Example
>
> ```fsharp
> open IcedTasks
>
> // Lazy + cancellable
> let downloadData url = cancellableTask {
>     let! response = HttpClient.GetAsync(url, ct)
>     return response.Content.ReadAsStringAsync()
> }
>
> // Parallel execution
> let fetchAll urls = parallelAsync {
>     let! results = urls |> Seq.map downloadData
>     return results
> }
>
> // ValueTask for sync-fast path
> let tryCache key = valueTask {
>     match Cache.TryGet(key) with
>     | Some v -> return v
>     | None -> return! fetchFromDb key
> }
> ```
>
> Docs: <https://www.jimmybyrd.me/IcedTasks/>

##### After

> # IcedTasks
>
> ## Overview
>
> IcedTasks is an F# library that provides additional computation expressions for task-based asynchronous programming. It extends the standard F# task computation expression with specialized builders for performance, lazy evaluation, cancellation, and parallel execution.
>
> ## Installation
>
> Add the NuGet package to your project:
>
> ```bash
> dotnet add package IcedTasks
> ```
>
> Open the namespace in your F# code:
>
> ```fsharp
> open IcedTasks
> ```
>
> ## Computation Expressions
>
> ### ValueTask
>
> Use `valueTask` for better performance in synchronous scenarios. `ValueTask` is a discriminated union of a value or a task, avoiding allocation when the result is already available.
>
> ```fsharp
> let myValueTask = valueTask {
>     let! theAnswer = valueTask { return 42 }
>     return theAnswer
> }
> ```
>
> ### ColdTask
>
> Use `coldTask` for lazy evaluation. The task does not start until you invoke the returned function. This is similar to how F# `Async` works.
>
> ```fsharp
> let coldTask_dont_start_immediately = task {
>     let mutable someValue = null
>     let fooColdTask = coldTask { someValue <- 42 }
>     do! Async.Sleep(100)
>     // fooColdTask has not executed yet
>     do! fooColdTask ()
>     // now someValue = 42
> }
> ```
>
> ### CancellableTask and CancellableValueTask
>
> Use `cancellableTask` or `cancellableValueTask` when you need to flow a `CancellationToken` through the computation. The computation checks cancellation before each bind.
>
> Access the token by binding against a function that takes `CancellationToken`:
>
> ```fsharp
> let writeJunkToFile = 
>     let path = Path.GetTempFileName()
>     cancellableTask {
>         let junk = Array.zeroCreate bufferSize
>         use file = File.Create(path)
>         for i = 1 to manyIterations do
>             do! fun ct -> file.WriteAsync(junk, 0, junk.Length, ct)
>     }
> ```
>
> Or bind against `CancellableTask.getCancellationToken`:
>
> ```fsharp
> let writeJunkToFile = 
>     let path = Path.GetTempFileName()
>     cancellableTask {
>         let junk = Array.zeroCreate bufferSize
>         use file = File.Create(path)
>         let! ct = CancellableTask.getCancellationToken ()
>         for i = 1 to manyIterations do
>             do! file.WriteAsync(junk, 0, junk.Length, ct)
>     }
> ```
>
> Execute by passing a token:
>
> ```fsharp
> let executeWriting = task {
>     use cts = new CancellationTokenSource()
>     do! writeJunkToFile cts.Token
> }
> ```
>
> ### ParallelAsync
>
> Use `parallelAsync` to execute multiple async operations in parallel using applicative syntax.
>
> ```fsharp
> let getDataFromAFewSites = parallelAsync {
>     let! result1 = exampleHttpCall "site1"
>     and! result2 = exampleHttpCall "site2"
>     and! result3 = exampleHttpCall "site3"
>     return ()
> }
> ```
>
> ### AsyncEx
>
> Use `asyncEx` for enhanced async semantics:
>
> - Supports `use` with `IAsyncDisposable`
> - Allows `let!`/`do!` against `Task`, `ValueTask`, or any awaitable
> - Unwraps exceptions from tasks (no `AggregateException`)
> - Supports `for` loops over `IAsyncEnumerable`
>
> ```fsharp
> let myAsyncEx = asyncEx {
>     use _ = fakeDisposable ()
>     let! _ = task { return 42 }
>     let! _ = valueTask { return 42 }
>     let! _ = Task.Yield()
>     let items = taskSeq { yield 42; yield 1701 }
>     let mutable sum = 0
>     for i in items do
>         sum <- sum + i
>     return sum
> }
> ```
>
> ### Task Polyfill
>
> Use `IcedTasks.Polyfill.Task` to shadow the built-in F# `task` CE with fixes for exception handling and other issues.
>
> ```fsharp
> open IcedTasks.Polyfill.Task
>
> let myTask = task {
>     let! result = someTask
>     return result
> }
> ```
>
> ## When to Use Each Builder
>
> | Builder | Use Case |
> |---------|----------|
> | `valueTask` | Synchronous-heavy code paths; avoid task allocation |
> | `coldTask` | Deferred execution; re-runnable tasks |
> | `cancellableTask` | Long-running operations needing cancellation; implicit token flow |
> | `cancellableValueTask` | Same as `cancellableTask` but with `ValueTask` performance |
> | `parallelAsync` | Multiple independent async operations that can run concurrently |
> | `asyncEx` | Need `IAsyncDisposable`, task/ValueTask binding, or `IAsyncEnumerable` |
> | `task` (polyfill) | Fix F# task CE exception unwrapping |
>
> ## Documentation
>
> Full documentation is available at: https://www.jimmybyrd.me/IcedTasks/
>
> The site includes a [Choosing a builder](https://www.jimmybyrd.me/IcedTasks/Explanations/Choosing-a-builder.html) guide with a comparison table of all builders, aliases, and pooling variants.

##### Observed differences

- The "before" text uses a table with three columns (Expression, Type, Use Case). The "after" text uses separate subsections with full explanations and code samples for each builder.
- The "after" text structures the installation as a numbered procedure with explicit steps. The "before" text gives a one-line command.
- The "before" text uses a concise bullet list for "When It's Most Useful" with numbered items and bold labels. The "after" text uses a table mapping each builder to a use case.
- Both versions include code examples, but the "after" text provides more complete, runnable snippets for each builder.
- The "after" text removes contractions ("doesn't", "can't") and uses more formal phrasing throughout.
- The "after" text includes a link to the full documentation site at the end.

---

## Example 2: Procedure (publish a NuGet package)

**Prompt:** What are the steps to publish a new package to NuGet?

### Claude Code — Claude Fable 5 (`claude-fable-5`)

#### Before

> 1. **Create an account and API key**
>    - Sign in at [nuget.org](https://www.nuget.org) (Microsoft account).
>    - Go to your account → **API Keys** → **Create**, give it a name, set the glob pattern (e.g. `*` or your package ID), and select the **Push** scope. Copy the key immediately — it's only shown once.
>
> 2. **Prepare the project metadata** (in your `.csproj`/`.fsproj`):
>    ```xml
>    <PropertyGroup>
>      <PackageId>Your.Package.Name</PackageId>
>      <Version>1.0.0</Version>
>      <Authors>Your Name</Authors>
>      <Description>What the package does.</Description>
>      <PackageLicenseExpression>MIT</PackageLicenseExpression>
>      <PackageProjectUrl>https://github.com/you/repo</PackageProjectUrl>
>      <RepositoryUrl>https://github.com/you/repo</RepositoryUrl>
>      <PackageReadmeFile>README.md</PackageReadmeFile>
>      <PackageTags>tag1;tag2</PackageTags>
>    </PropertyGroup>
>    ```
>    If you use `PackageReadmeFile`, also include the file in the package:
>    ```xml
>    <ItemGroup>
>      <None Include="README.md" Pack="true" PackagePath="\" />
>    </ItemGroup>
>    ```
>    Recommended extras: `<GenerateDocumentationFile>true</GenerateDocumentationFile>`, SourceLink (`Microsoft.SourceLink.GitHub`), and `<IncludeSymbols>true</IncludeSymbols>` with `<SymbolPackageFormat>snupkg</SymbolPackageFormat>`.
>
> 3. **Pack it**
>    ```
>    dotnet pack -c Release
>    ```
>    This produces `bin/Release/Your.Package.Name.1.0.0.nupkg` (and a `.snupkg` if symbols are enabled).
>
> 4. **Verify the package (optional but wise)**
>    - Inspect contents with the [NuGet Package Explorer](https://github.com/NuGetPackageExplorer/NuGetPackageExplorer) or `dotnet nuget verify`.
>    - Test-install it locally: `dotnet nuget add source ./bin/Release --name local`, then reference it from a scratch project.
>    - Run `dotnet-validate` or NPE's health checks for metadata/SourceLink issues.
>
> 5. **Push to NuGet.org**
>    ```
>    dotnet nuget push bin/Release/Your.Package.Name.1.0.0.nupkg `
>      --api-key YOUR_API_KEY `
>      --source https://api.nuget.org/v3/index.json
>    ```
>    The `.snupkg` symbol package is pushed automatically alongside it if present.
>
> 6. **Wait for validation and indexing**
>    - NuGet.org scans and validates the package; it typically becomes searchable/installable within a few minutes to an hour.
>    - You'll get an email confirmation once it's published.
>
> Key things to remember:
>
> - **Package IDs are first-come, first-served** — check the ID is free before you build around it, and consider [reserving a prefix](https://learn.microsoft.com/en-us/nuget/nuget-org/id-prefix-reservation) for your org.
> - **Versions are immutable** — you can unlist a version but never overwrite or truly delete it. If you push a broken 1.0.0, fix it in 1.0.1.
> - **Use SemVer** (`Major.Minor.Patch`, with `-alpha.1` style suffixes for prereleases).
> - **For CI/CD**, store the API key as a secret (e.g. GitHub Actions secret) and push from a release workflow instead of your machine; NuGet.org also supports [Trusted Publishing](https://learn.microsoft.com/en-us/nuget/nuget-org/trusted-publishing) from GitHub Actions so you can avoid long-lived API keys entirely.

#### After

> ## How to publish a new package to NuGet
>
> ### Prerequisites
>
> 1. Install the .NET SDK.
> 2. Create an account on nuget.org.
> 3. Create an API key on nuget.org. Go to your account settings and select "API Keys".
> 4. Give the API key a name, a glob pattern, and the "Push" permission.
> 5. Copy the API key immediately. The site shows the key only one time.
>
> ### Prepare the package
>
> 1. Open your project file (`.csproj` or `.fsproj`).
> 2. Set the `PackageId` property to a unique name.
> 3. Set the `Version` property.
> 4. Set the `Authors` and `Description` properties.
> 5. Set the `PackageLicenseExpression` property, for example `MIT`.
> 6. Add the `RepositoryUrl` and `PackageReadmeFile` properties when they apply.
>
> Example:
>
> ```xml
> <PropertyGroup>
>   <PackageId>MyCompany.MyPackage</PackageId>
>   <Version>1.0.0</Version>
>   <Authors>Your Name</Authors>
>   <Description>A short description of the package.</Description>
>   <PackageLicenseExpression>MIT</PackageLicenseExpression>
> </PropertyGroup>
> ```
>
> ### Create the package
>
> 1. Build the project in Release configuration:
>
>    ```text
>    dotnet build -c Release
>    ```
>
> 2. Create the `.nupkg` file:
>
>    ```text
>    dotnet pack -c Release
>    ```
>
> 3. Find the `.nupkg` file in the `bin/Release` folder.
>
> ### Test the package (recommended)
>
> 1. Add the `.nupkg` file to a local folder feed.
> 2. Install the package in a test project from that feed.
> 3. Make sure that the package installs and operates correctly.
>
> ### Push the package
>
> 1. Push the package to nuget.org:
>
>    ```text
>    dotnet nuget push bin/Release/MyCompany.MyPackage.1.0.0.nupkg --api-key YOUR_API_KEY --source https://api.nuget.org/v3/index.json
>    ```
>
> 2. Wait for validation. Validation usually completes in 5 to 15 minutes.
> 3. Open the package page on nuget.org and make sure that the package is listed.
>
> ### Notes
>
> - A package version is permanent. You cannot push the same version two times.
> - You can unlist a package, but you cannot delete it.
> - Do not put the API key in source control. Use a secret store or an environment variable.

#### Observed differences

- Each numbered step contains one instruction. The "before" text combines several actions in one bullet, for example the API-key step: name, glob pattern, scope, and copy in one sentence.
- Prerequisites come first, before the dependent actions.
- Parenthetical asides and em-dash chains became separate short sentences or notes.
- Expected results are explicit: the output folder, the validation time, and the verification step.
- The version-immutability warning became two plain statements: "A package version is permanent. You cannot push the same version two times."

### Other models

#### Codex — GPT-5.6 (`gpt-5.6-sol`)

##### Before

> 1. Update the package version in the project file.
> 2. Verify the package metadata, including its ID, description, authors, license, and repository URL.
> 3. Build and test the project in Release configuration:
>    ```shell
>    dotnet test --configuration Release
>    ```
> 4. Create the NuGet package:
>    ```shell
>    dotnet pack --configuration Release
>    ```
> 5. Inspect the generated `.nupkg` file in the output directory.
> 6. Obtain an API key from NuGet.org.
> 7. Publish the package:
>    ```shell
>    dotnet nuget push path/to/package.nupkg --api-key YOUR_API_KEY --source https://api.nuget.org/v3/index.json
>    ```
> 8. Confirm that the package appears on NuGet.org and can be restored in a test project.

##### After

> 1. Create a NuGet.org account.
>
> 2. Add the required package metadata to the project file.
>
> 3. Set `PackageId`, `Version`, `Authors`, `Description`, and repository information.
>
> 4. Build and test the project.
>
> 5. Create the package:
>
> ```console
> dotnet pack --configuration Release
> ```
>
> 6. Inspect the generated `.nupkg` file and confirm its contents.
>
> 7. Create a scoped API key on NuGet.org.
>
> 8. Publish the package:
>
> ```console
> dotnet nuget push ./bin/Release/Package.Id.1.2.3.nupkg --api-key <API_KEY> --source https://api.nuget.org/v3/index.json
> ```
>
> 9. Verify the package version on NuGet.org.
>
> 10. Install the published package in a test project.

##### Observed differences

- The "after" text adds the NuGet.org account as a prerequisite.
- Each "after" step contains one instruction.
- The API key becomes a scoped API key.
- The final verification is split into two explicit actions.

#### GitHub Copilot CLI — Claude Sonnet 5 (`claude-sonnet-5`)

##### Before

> 1. Create a NuGet account and add your API key from nuget.org.
> 2. Update the package metadata in your project file (`PackageId`, `Version`, `Authors`, `Description`, etc.).
> 3. Build and pack the project:
>    `dotnet pack -c Release`
> 4. Verify the `.nupkg` file in the output folder.
> 5. Publish the package:
>    `dotnet nuget push bin\Release\YourPackage.<version>.nupkg --api-key <YOUR_API_KEY> --source https://api.nuget.org/v3/index.json`
> 6. Confirm the package appears on NuGet.org.
> 7. For later releases, increment the version and repeat.

##### After

> 1. Create a NuGet.org account, if you do not have one.
>
> 2. Create an API key in your NuGet.org account.
>
> 3. Set the package ID, version, authors, and description in the project file.
>
> 4. Build the package with `dotnet pack -c Release`.
>
> 5. Publish the `.nupkg` file with `dotnet nuget push <package-file> --api-key <key> --source https://api.nuget.org/v3/index.json`.
>
> 6. Verify that the package appears on NuGet.org and that the version is correct.

##### Observed differences

- The "after" text splits account creation and API key creation into two separate steps instead of combining them in step 1.
- Step 4's build-and-pack combination in the "before" text becomes one build step in the "after" text.
- The closing step changed from an open-ended "repeat for later releases" to a concrete verification of package presence and version.

#### opencode — DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`)

##### Before

> 1. Build the package: `dotnet pack -c Release` → produces a `.nupkg` file.
> 2. (Optional) Verify it installs locally: `dotnet add package <Name> --source <local folder>`.
> 3. Create an API key at nuget.org → Account → API Keys.
> 4. Push it: `dotnet nuget push bin/Release/My.Package.1.0.0.nupkg -k <API_KEY> -s https://api.nuget.org/v3/index.json`.
>
> New packages (and major versions) need manual approval before they appear in search.

##### After

> **Prerequisite**
>
> Have a nuget.org account and an API key.
>
> **Procedure**
>
> 1. Build the project in Release configuration.
> 2. Create the package. Run the command `dotnet pack`.
> 3. Publish the package. Run the command `dotnet nuget push`.
> 4. Add your API key and the package file to the push command.
> 5. When the push finishes, check the package page on nuget.org.

##### Observed differences

- The "after" text separates the prerequisite (the account and the API key) from the procedure. The "before" text makes the API key one of the steps.
- Each "after" step is one instruction.
- The "before" text uses arrows and a parenthetical "(Optional)". The "after" text uses plain statements.
- The "after" text adds a final step that checks the package page.
- The "before" text adds the manual-approval fact, which the prompt did not state.

#### opencode — nemotron-3-ultra-free (`opencode/nemotron-3-ultra-free`)

##### Before

> To publish a NuGet package:
>
> 1. **Create the package** - Run `dotnet pack` in your project directory (or `nuget pack` for .nuspec files)
> 2. **Test locally** - Install to a local feed: `dotnet add package --source ./nupkg YourPackage`
> 3. **Get an API key** - Create one at [nuget.org](https://www.nuget.org/account/apikeys)
> 4. **Push to NuGet** - Run `dotnet nuget push *.nupkg --api-key YOUR_KEY --source https://api.nuget.org/v3/index.json`
>
> Optional: Use `dotnet nuget push --skip-duplicate` to avoid errors if version exists.

##### After

> To publish a new package to NuGet:
>
> 1. Create a NuGet package from your project.
> 2. Sign the package if required.
> 3. Open a terminal.
> 4. Run `dotnet nuget push <package-file> --source https://api.nuget.org/v3/index.json --api-key <your-api-key>`.
> 5. Verify the package appears on nuget.org.
>
> **Prerequisites:**
> - A NuGet.org account with an API key.
> - The .NET SDK installed.
> - A built project or `.nupkg` file ready.

##### Observed differences

- The "before" text uses bold labels for each step (Create the package, Test locally, Get an API key, Push to NuGet). The "after" text uses plain numbered steps without bold labels.
- The "after" text splits prerequisites into a separate section at the end. The "before" text includes getting an API key as step 3 in the main sequence.
- The "before" text includes an optional local testing step and a `--skip-duplicate` flag tip. The "after" text omits these as they were not in the prompt.
- The "after" text uses "Run" as the verb for the push command, making it a direct instruction. The "before" text says "Run `dotnet nuget push...`" with more parameter detail.
- The "after" text adds "Verify the package appears on nuget.org" as an explicit final step.

---

## Example 3: Error message

**Prompt:** Write an error message for an application that cannot load the user's settings file at `%APPDATA%\MyApp\settings.json` because the file contains invalid JSON at line 12.

### Claude Code — Claude Fable 5 (`claude-fable-5`)

#### Before

> Unable to load settings
>
> MyApp could not load your settings because the settings file contains invalid JSON.
>
> File: %APPDATA%\MyApp\settings.json
> Problem: Invalid JSON syntax at line 12
>
> What you can do:
> - Open the file in a text editor and fix the error at line 12 (a common cause is a missing or extra comma, quote, or bracket).
> - Or delete the file to reset MyApp to its default settings. Your customizations will be lost.
>
> MyApp will continue with default settings for this session. Changes you make to settings will not be saved until the file is fixed or removed.

#### After

> Cannot load the settings file.
>
> The file %APPDATA%\MyApp\settings.json contains invalid JSON at line 12.
>
> Correct the JSON at line 12, or delete the file to get the default settings. Then start the application again.

#### Observed differences

- The "after" text is three short statements: the failed operation, the cause, and the corrective action.
- The "before" text states the failure two times: "Unable to load settings" and "could not load your settings".
- The "before" text adds behavior that the prompt did not state: "MyApp will continue with default settings for this session." The skill version contains only the known facts.
- The passive "will not be saved until the file is fixed" pattern does not appear in the "after" text.

### Other models

#### Codex — GPT-5.6 (`gpt-5.6-sol`)

##### Before

> Error: Failed to load the user settings configuration file located at `%APPDATA%\MyApp\settings.json` due to invalid JSON syntax detected on line 12. Please correct the malformed JSON and restart the application.

##### After

> MyApp cannot load `%APPDATA%\MyApp\settings.json`. The file contains invalid JSON at line 12. Correct the JSON, and try again.

##### Observed differences

- One long sentence became three short statements.
- The "after" text names the application, the failed operation, and the cause.
- "Please correct the malformed JSON and restart the application" became the direct instruction "Correct the JSON, and try again."
- The "after" text does not use the abstract phrase "settings configuration file."

#### GitHub Copilot CLI — Claude Sonnet 5 (`claude-sonnet-5`)

##### Before

> Failed to load settings file:
> %APPDATA%\MyApp\settings.json
>
> The file contains invalid JSON syntax at line 12. Fix the syntax error, or delete the file to restore default settings, then restart MyApp.

##### After

> Error: The application cannot read the settings file.
>
> File: %APPDATA%\MyApp\settings.json
> Problem: The file has invalid JSON data at line 12.
>
> Corrective action: Open the file and correct the JSON data at line 12. Then restart the application. If the problem stays, delete the file. The application will make a new settings file with default values.

##### Observed differences

- The "after" text labels each part of the message: "Error", "File", "Problem", "Corrective action". The "before" text runs the same information together in two sentences.
- The "before" text offers "fix the error, or delete the file" as one combined instruction. The "after" text orders the same two options as sequential steps: fix first, delete only if the problem stays.
- "Restore default settings" (before) and "make a new settings file with default values" (after) describe the same outcome; the "after" phrasing states the mechanism (a new file) rather than the abstract "restore."

#### opencode — DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`)

##### Before

> Unable to load your settings file at `%APPDATA%\MyApp\settings.json`: the file contains invalid JSON at line 12. Fix or delete the file, then try again.

##### After

> Cannot load the settings file at %APPDATA%\MyApp\settings.json. The file has invalid JSON at line 12. Correct the file and start the application again.

##### Observed differences

- One long sentence with a colon became three short statements: the failed operation, the cause, and the corrective action.
- The "after" text gives one corrective action ("Correct the file and start the application again"). The "before" text offers two options in one sentence ("Fix or delete the file").
- Both versions keep the file path and the line number.

#### opencode — nemotron-3-ultra-free (`opencode/nemotron-3-ultra-free`)

##### Before

> Failed to load settings from `%APPDATA%\MyApp\settings.json`: Invalid JSON at line 12.

##### After

> The application cannot load the settings file at `%APPDATA%\MyApp\settings.json`. The file contains invalid JSON at line 12. Correct the JSON syntax at line 12.

##### Observed differences

- The "before" text is one sentence with a colon separating the failure from the cause. The "after" text splits this into three short statements: the failed operation, the cause, and the corrective action.
- The "before" text uses "Failed to load settings from..." with a colon. The "after" text uses "The application cannot load the settings file at..." as the first statement.
- The "after" text uses "Correct the JSON syntax at line 12" as a direct imperative instruction. The "before" text does not include a corrective action.
- Both versions preserve the file path and line number.

---

## Example 4: Code comment

**Prompt:** Write a code comment to place above this C# retry loop. Context: the upstream API returns intermittent 429 responses during peak load. Issue #123 tracks adding a rate-limit budget that will remove the need for this loop.

```csharp
for (var attempt = 0; attempt < 5; attempt++)
{
    var response = await client.SendAsync(request);
    if (response.StatusCode != (HttpStatusCode)429) return response;
    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
}
```

### Claude Code — Claude Fable 5 (`claude-fable-5`)

#### Before

```csharp
// Retry on HTTP 429 with exponential backoff (1s, 2s, 4s, 8s, 16s): the upstream
// API intermittently rate-limits us during peak load. If all 5 attempts are
// throttled, the last 429 response is returned to the caller.
// TODO: Remove once issue #123 (client-side rate-limit budget) lands, which
// should prevent us from hitting 429s in the first place.
```

#### After

```csharp
// Workaround: the upstream API returns intermittent 429 responses during peak load.
// This loop retries the request a maximum of 5 times with exponential backoff.
// Remove this loop when issue #123 adds a rate-limit budget.
```

#### Observed differences

- The "after" comment does not restate the code. The "before" comment lists the delay values and the return behavior, which the code already shows.
- The removal condition is one direct instruction: "Remove this loop when issue #123 adds a rate-limit budget."
- The difference is small in this example. The unaided model already wrote a serviceable workaround comment. Select this example only if you want to show a case with a modest change.

### Other models

#### Codex — GPT-5.6 (`gpt-5.6-sol`)

##### Before

```csharp
// Retry requests that receive intermittent 429 responses from the upstream API during peak load.
// This workaround can be removed after the rate-limit budget tracked in issue #123 is implemented.
```

##### After

```csharp
// During peak load, the upstream API intermittently returns 429 responses.
// Remove this retry loop when Issue #123 adds a rate-limit budget.
```

##### Observed differences

- The "after" comment states the condition before the result.
- The passive removal statement became a direct instruction.
- "This workaround" became the more precise term "this retry loop."
- Both versions preserve the cause and the removal condition.

#### GitHub Copilot CLI — Claude Sonnet 5 (`claude-sonnet-5`)

##### Before

```csharp
// Retries on HTTP 429 (Too Many Requests) with exponential backoff, since the
// upstream API intermittently rate-limits us during peak load. This loop is a
// temporary workaround; #123 will add a rate-limit budget to avoid needing it.
```

##### After

```csharp
// This loop is a workaround for intermittent 429 responses from the upstream API during peak load.
// The loop retries the request up to 5 times with exponential backoff.
// Issue #123 will add a rate-limit budget and remove this loop.
```

##### Observed differences

- The "before" comment is one long sentence with a semicolon joining the cause and the removal condition. The "after" comment splits the same information into three short sentences.
- "This loop is a temporary workaround" (before) becomes "This loop is a workaround" (after); "temporary" was redundant with the removal sentence that follows.
- The retry count ("up to 5 times") is stated explicitly in the "after" text instead of being left implicit in the loop bound.

#### opencode — DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`)

##### Before

```csharp
// The upstream API returns 429 (Too Many Requests) responses during peak load.
// Retry up to 5 times with exponential backoff (2, 4, 8, 16 seconds).
// Issue #123 tracks a rate-limit budget that will remove the need for this loop.
```

##### After

```csharp
// The upstream API returns a 429 status during peak load.
// This loop retries the request because the load is temporary.
// Issue #123 adds a rate-limit budget that removes the need for this loop.
```

##### Observed differences

- The "after" comment does not restate the code. The "before" comment lists the retry count and the backoff values (2, 4, 8, 16 seconds), which the loop already shows.
- The "after" comment states the workaround and its condition ("This loop retries the request because the load is temporary").
- The removal condition became a direct statement: "Issue #123 adds a rate-limit budget that removes the need for this loop."
- The "after" comment names the status number only ("a 429 status"); the "before" comment adds the "Too Many Requests" label.

#### opencode — nemotron-3-ultra-free (`opencode/nemotron-3-ultra-free`)

##### Before

```csharp
// Retries on 429 (Too Many Requests) with exponential backoff.
// Upstream API returns intermittent 429s during peak load.
// Issue #123 tracks adding a rate-limit budget to eliminate this retry loop.
```

##### After

```csharp
// Retry on 429 (rate limit) during peak load. Issue #123 will replace this with a rate-limit budget.
```

##### Observed differences

- The "before" text uses three separate comment lines. The "after" text condenses to a single line.
- The "before" text spells out "Too Many Requests" and mentions "exponential backoff" explicitly. The "after" text abbreviates to "rate limit" and omits the backoff detail.
- The "before" text says "Issue #123 tracks adding a rate-limit budget to eliminate this retry loop." The "after" text uses the more direct "Issue #123 will replace this with a rate-limit budget."
- The "after" text removes the period after "load" and uses a single sentence structure.
- Both versions reference Issue #123 as the removal condition.

---

## Example 5: Destructive command documentation

**Prompt:** Write documentation for the `db reset` command for a CLI reference page. Facts: the command deletes all tables and then applies the initial schema; all data in the database is permanently lost.

### Claude Code — Claude Fable 5 (`claude-fable-5`)

#### Before

> ## db reset
>
> Resets the database to its initial state.
>
> ### Synopsis
>
> ```
> db reset
> ```
>
> ### Description
>
> The `db reset` command deletes all tables in the database and then applies the initial schema. Use this command to return the database to a clean, freshly initialized state.
>
> **Warning:** This operation is destructive. All data in the database is permanently lost and cannot be recovered. Back up any data you need before running this command.
>
> ### Behavior
>
> 1. Drops all existing tables from the database.
> 2. Applies the initial schema, recreating the base table structure.
>
> ### Example
>
> ```
> $ db reset
> ```
>
> After the command completes, the database contains only the tables defined in the initial schema, with no data.
>
> ### See also
>
> - Back up your database before resetting if you may need the data later.

#### After

> ## db reset
>
> ### Description
>
> The `db reset` command deletes all tables from the database. The command then applies the initial schema.
>
> **CAUTION: The `db reset` command permanently deletes all data in the database. You cannot recover the data.**
>
> ### Usage
>
> ```
> db reset
> ```
>
> ### Behavior
>
> When you run the command, it does these steps:
>
> 1. The command deletes all tables from the database.
> 2. The command applies the initial schema.
>
> ### Before you start
>
> Make a backup of the database if you must keep the data.

#### Observed differences

- The risk statement uses a caution format and appears before the usage section.
- The backup instruction is in a "Before you start" section. The "before" text puts an instruction under "See also", where a reader expects links.
- Each behavior sentence names the actor: "The command deletes", "The command applies".
- Decorative wording was removed: "clean, freshly initialized state".

### Other models

#### Codex — GPT-5.6 (`gpt-5.6-sol`)

##### Before

> ### `db reset`
>
> Deletes every table in the database and then applies the initial schema.
>
> ```text
> db reset
> ```
>
> > **Warning:** This operation permanently deletes all data in the database. The deleted data cannot be recovered.

##### After

> ## `db reset`
>
> Deletes all tables in the database. Then, the command applies the initial schema.
>
> > **CAUTION:** Make sure that you do not need the database data. The command permanently deletes all data.

##### Observed differences

- The behavior became two sentences in execution order.
- The safety label changed from "Warning" to "CAUTION" because the risk is data damage, not injury.
- The caution starts with an instruction and then states the result.
- The "after" text removes the usage block, which the prompt did not require.

#### GitHub Copilot CLI — Claude Sonnet 5 (`claude-sonnet-5`)

##### Before

> ## `db reset`
>
> Deletes all tables in the database and then applies the initial schema.
>
> ### Usage
>
> ```
> db reset
> ```
>
> ### Description
>
> The `db reset` command drops every table in the database, then runs the initial schema to recreate the database structure in its original, empty state.
>
> ### Warning
>
> **All data in the database is permanently lost when you run this command.** This action cannot be undone. Back up any data you need to keep before you run `db reset`.

##### After

> ## db reset
>
> This command deletes all tables in the database. Then, it applies the initial schema to the database.
>
> **Warning: This command permanently deletes all data in the database. You cannot recover the data after you run this command.**

##### Observed differences

- The "before" text splits the behavior across a summary line and a separate "Description" section that restates it. The "after" text states the behavior once, in the order the command performs it.
- "Recreate the database structure in its original, empty state" (before) becomes "applies the initial schema to the database" (after), removing the descriptive phrase "original, empty state" that adds no new fact.
- The "before" text uses a bolded sentence inside a "Warning" heading plus two more sentences. The "after" text uses one bolded warning with two short sentences and no separate heading.

#### opencode — DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`)

##### Before

> ## `db reset`
>
> Deletes all tables in the database and then applies the initial schema.
>
> **Warning:** This command permanently deletes all data in the database. The data cannot be recovered. Run this command only when you are sure that you want to remove all data.
>
> ### Usage
>
> ```
> db reset
> ```
>
> ### Description
>
> The `db reset` command performs these steps:
>
> 1. Deletes all tables from the database.
> 2. Applies the initial schema to create a clean set of tables.
>
> Use this command to return the database to its initial, empty state.
>
> ### Examples
>
> Reset the database:
>
> ```
> db reset
> ```
>
> ### See also
>
> - `db migrate` — Apply pending schema changes without deleting data.

##### After

> The `db reset` command deletes all tables in the database. The command then applies the initial schema to the database.
>
> CAUTION: This command permanently deletes all data in the database. Back up the database before you run this command.

##### Observed differences

- The behavior became two sentences in execution order, each naming the command as the subject.
- The risk label changed from "Warning" to "CAUTION", because the risk is data damage, not injury.
- The "after" text states the backup step before the command. The "before" text does not state a backup step.
- The "after" text removes the usage, examples, and "See also" sections, which the prompt did not require.
- Decorative wording was removed: "a clean set of tables", "its initial, empty state", and the unrelated `db migrate` entry.

#### opencode — nemotron-3-ultra-free (`opencode/nemotron-3-ultra-free`)

##### Before

> ## `db reset`
>
> Resets the database to its initial state by deleting all tables and reapplying the initial schema.
>
> ### Behavior
> - Drops all existing tables in the database
> - Applies the initial schema migrations
> - **All data is permanently lost** — this operation cannot be undone
>
> ### Usage
> ```bash
> db reset [flags]
> ```
>
> ### Flags
> | Flag | Description |
> |------|-------------|
> | `--yes`, `-y` | Skip confirmation prompt |
> | `--force` | Force reset even if database is in use |
>
> ### Example
> ```bash
> # With confirmation prompt
> db reset
>
> # Non-interactive (CI/CD)
> db reset --yes
> ```
>
> ### Warning
> This command destroys all data. Ensure you have backups before running in production environments.

##### After

> The `db reset` command deletes all tables in the database. The command then applies the initial schema. All data in the database is permanently lost.

##### Observed differences

- The "before" text includes a full CLI reference structure with headings (Behavior, Usage, Flags, Example, Warning). The "after" text condenses to three short sentences.
- The "before" text uses a table for flags and code blocks for usage examples. The "after" text omits these as the prompt only asked for documentation of the command's behavior and data loss fact.
- The "before" text uses "**All data is permanently lost** — this operation cannot be undone" with em-dash. The "after" text uses "All data in the database is permanently lost" as a separate sentence.
- The "after" text uses "The command then applies the initial schema" with "The command" as the subject for both actions. The "before" text uses "deleting all tables and reapplying the initial schema" as a participial phrase.
- The "before" text adds a "Warning" section at the end with backup advice. The "after" text states the data loss fact directly without additional advisory text.

---

## Example 6: Changelog entry

**Prompt:** Write a changelog entry for this change: responses from the /users endpoint are now cached for 60 seconds. Load tests showed the median response time dropped from 480 ms to 12 ms.

### Claude Code — Claude Fable 5 (`claude-fable-5`)

#### Before

> ### Changed
> - Responses from the `/users` endpoint are now cached for 60 seconds. Load tests showed the median response time dropped from 480 ms to 12 ms.

#### After

> ### Changed
>
> - The `/users` endpoint now caches its responses for 60 seconds. Load tests show that this change decreased the median response time from 480 ms to 12 ms.

#### Observed differences

- The passive "are now cached" became the active "The `/users` endpoint now caches its responses".
- The informal "dropped" became the precise verb "decreased".
- The difference is small in this example, because the prompt already contained the exact facts. Select this example only if you want to show a case with a modest change.

### Other models

#### Codex — GPT-5.6 (`gpt-5.6-sol`)

##### Before

> ### Improved `/users` endpoint performance
>
> Responses from the `/users` endpoint are now cached for 60 seconds, significantly reducing response times for repeated requests. In load testing, this optimization reduced the median response time from 480 ms to 12 ms.

##### After

> The `/users` endpoint now caches responses for 60 seconds. In load tests, the median response time decreased from 480 ms to 12 ms.

##### Observed differences

- The passive "are now cached" became the active "endpoint now caches."
- The "after" text removes the unsupported qualifier "significantly."
- "This optimization" became the concrete subject "the median response time."
- The performance values and cache duration remain unchanged.

#### GitHub Copilot CLI — Claude Sonnet 5 (`claude-sonnet-5`)

##### Before

> ### Added
> - Responses from the `/users` endpoint are now cached for 60 seconds, reducing median response time from 480 ms to 12 ms in load testing.

##### After

> The system now stores the response from the /users endpoint for 60 seconds. Load tests show that the median response time decreased from 480 milliseconds to 12 milliseconds.

##### Observed differences

- The "before" text is one sentence joining the change and the result with "reducing". The "after" text splits the change and the result into two sentences.
- "Cached" (before) became "stores" (after) in the change sentence, and "ms" was spelled out as "milliseconds" in both figures.
- The "before" text omits a stated subject for the caching behavior ("Responses ... are now cached"), passive voice. The "after" text names "The system" as the actor.

#### opencode — DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`)

##### Before

> - Responses from the `/users` endpoint are now cached for 60 seconds.
> - Load tests showed the median response time dropped from 480 ms to 12 ms.

##### After

> The /users endpoint now caches responses for 60 seconds. Load tests show the median response time fell from 480 ms to 12 ms.

##### Observed differences

- The passive "are now cached" became the active "The /users endpoint now caches responses".
- The "before" text uses bullets. The "after" text uses two complete sentences.
- "showed" and "dropped" became "show" and "fell".
- Both versions keep the cache duration and the performance values.

#### opencode — nemotron-3-ultra-free (`opencode/nemotron-3-ultra-free`)

##### Before

> ## [Unreleased]
>
> ### Changed
> - Cache `/users` endpoint responses for 60 seconds
>
> ### Performance
> - Median response time for `/users` endpoint reduced from 480 ms to 12 ms (per load tests)

##### After

> ### Added
>
> - The `/users` endpoint now caches responses for 60 seconds.
> - Load tests show the median response time decreased from 480 ms to 12 ms.

##### Observed differences

- The "before" text uses a changelog format with "## [Unreleased]" and "### Changed"/"### Performance" headings. The "after" text uses a simpler "### Added" heading with bullet points.
- The "before" text uses "Cache `/users` endpoint responses for 60 seconds" as an imperative bullet. The "after" text uses "The `/users` endpoint now caches responses for 60 seconds" with an explicit subject and active verb.
- The "before" text says "reduced from 480 ms to 12 ms (per load tests)" as a fragment. The "after" text says "Load tests show the median response time decreased from 480 ms to 12 ms" as a complete sentence with "Load tests" as the subject.
- The "before" text uses "ms" abbreviation. The "after" text also uses "ms".
- Both versions preserve the 60-second cache duration and the 480 ms to 12 ms performance improvement.

---

## Example 7: Ambiguous reference in a description

**Prompt:** Write a short description of how the proxy handles a request, for an architecture document. Facts: the proxy validates the request, then forwards it to the backend, and it logs both the request and the response so that failed requests can be examined later.

### Claude Code — Claude Fable 5 (`claude-fable-5`)

#### Before

> The proxy handles each incoming request in three stages. First, it validates the request, rejecting anything malformed or unauthorized before it reaches the backend. Requests that pass validation are then forwarded to the backend service, and the backend's response is returned to the client. Throughout this flow, the proxy logs both the incoming request and the corresponding response, providing an audit trail that allows failed requests to be examined and diagnosed after the fact.

#### After

> The proxy examines each request to make sure that it is correct. The proxy then sends the request to the backend. The proxy writes the request and the response to a log. You can examine this log to find the cause of a request that failed.

#### Observed differences

- The passive constructions became active: "are then forwarded" and "to be examined" do not appear in the "after" text.
- Each "after" sentence has the proxy as the named subject and contains one action.
- The "before" text adds facts that the prompt did not state: rejection of unauthorized requests, a response returned to the client, and an "audit trail". The skill version states only the supplied facts.
- One regression: "examines each request to make sure that it is correct" is longer and less precise than the source verb "validates". A human editor can keep "validates" as the project term.

### Other models

#### Codex — GPT-5.6 (`gpt-5.6-sol`)

##### Before

> The proxy handles incoming requests by first performing validation to ensure that each request is valid. Once validation has completed successfully, the proxy forwards the request to the appropriate backend service. Both the original request and the corresponding backend response are logged, providing a record that can be used to investigate failed requests at a later time.

##### After

> The proxy validates each request. The proxy then forwards the request to the backend. The proxy logs the request and response for later failure analysis.

##### Observed differences

- Three long sentences became three short sentences with one action in each sentence.
- Each "after" sentence names the proxy as the subject.
- The "after" text preserves the project terms "validates," "backend," and "logs."
- The "after" text removes redundant phrases such as "performing validation to ensure that each request is valid."

#### GitHub Copilot CLI — Claude Sonnet 5 (`claude-sonnet-5`)

##### Before

> When the proxy receives a request, it first validates the request to confirm it is well-formed and permitted. It then forwards the validated request to the backend for processing. Throughout this exchange, the proxy logs both the outgoing request and the resulting response, creating a record that allows failed requests to be examined later during troubleshooting.

##### After

> The proxy receives the request and validates it. The proxy then records the request in the log. The proxy sends the request to the backend and receives the response from the backend. The proxy records the response in the log. The log lets you examine failed requests later.

##### Observed differences

- Three long sentences with subordinate clauses ("to confirm it is well-formed and permitted", "creating a record that allows...") became five short sentences, each with the proxy or the log as the subject.
- The "before" text adds an unstated inference: the request must be "well-formed and permitted." The prompt states only that the proxy "validates the request." The "after" text keeps the supplied verb "validates" without adding the extra qualifiers.
- The "after" text logs the request immediately after validation and logs the response immediately after the backend reply, matching the order these events occur; the "before" text describes both log writes as happening generically "throughout this exchange."

#### opencode — DeepSeek V4 Flash Free (`opencode/deepseek-v4-flash-free`)

##### Before

> The proxy validates each request. If the request is valid, the proxy forwards it to the backend. The proxy logs both the request and the response. These logs let operators examine failed requests later to find out what went wrong.

##### After

> The proxy validates the request. It forwards the request to the backend. It logs the request and the response. You can use the logs to examine failed requests later.

##### Observed differences

- Both versions use one action per sentence.
- The "before" text adds a condition that the prompt did not state ("If the request is valid").
- The "after" text uses "It" as the subject after the first sentence. The "before" text repeats "the proxy" and then introduces "These logs" and "operators".
- The "after" text addresses the reader directly: "You can use the logs to examine failed requests later."
- The "before" text adds the inference "to find out what went wrong".

#### opencode — nemotron-3-ultra-free (`opencode/nemotron-3-ultra-free`)

##### Before

> The proxy validates each incoming request, forwards valid requests to the backend service, and logs both the request and response payloads. This logging enables post-hoc analysis of failed requests.

##### After

> The proxy validates the request. The proxy forwards the validated request to the backend. The proxy logs the request and the response. The log lets you examine failed requests.

##### Observed differences

- The "before" text uses a single sentence with multiple clauses joined by commas. The "after" text splits into four short sentences, each with one action.
- The "before" text uses "forwards valid requests" which adds the condition "valid" that wasn't in the prompt. The "after" text uses "forwards the validated request" which is more precise.
- The "before" text says "logs both the request and response payloads" while the "after" text says "logs the request and the response" — the "after" text is more concise.
- The "before" text uses "This logging enables post-hoc analysis of failed requests" as a passive construction. The "after" text uses "The log lets you examine failed requests" with an active verb and direct address to the reader.
- The "after" text repeats "The proxy" as the subject for the first three sentences, maintaining consistent subject reference. The "before" text shifts from "The proxy" to "This logging" as the subject.
