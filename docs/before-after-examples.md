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

<!-- Copy this block for each additional harness and model. -->

#### Harness — Model (`model-id`)

##### Before

> _Paste the output without the skill._

##### After

> _Paste the output with the skill._

##### Observed differences

- _List the differences that you see between the two versions._

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

<!-- Copy this block for each additional harness and model. -->

#### Harness — Model (`model-id`)

##### Before

> _Paste the output without the skill._

##### After

> _Paste the output with the skill._

##### Observed differences

- _List the differences that you see between the two versions._

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

<!-- Copy this block for each additional harness and model. -->

#### Harness — Model (`model-id`)

##### Before

> _Paste the output without the skill._

##### After

> _Paste the output with the skill._

##### Observed differences

- _List the differences that you see between the two versions._

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

<!-- Copy this block for each additional harness and model. -->

#### Harness — Model (`model-id`)

##### Before

```text
Paste the output without the skill.
```

##### After

```text
Paste the output with the skill.
```

##### Observed differences

- _List the differences that you see between the two versions._

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

<!-- Copy this block for each additional harness and model. -->

#### Harness — Model (`model-id`)

##### Before

> _Paste the output without the skill._

##### After

> _Paste the output with the skill._

##### Observed differences

- _List the differences that you see between the two versions._

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

<!-- Copy this block for each additional harness and model. -->

#### Harness — Model (`model-id`)

##### Before

> _Paste the output without the skill._

##### After

> _Paste the output with the skill._

##### Observed differences

- _List the differences that you see between the two versions._

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

<!-- Copy this block for each additional harness and model. -->

#### Harness — Model (`model-id`)

##### Before

> _Paste the output without the skill._

##### After

> _Paste the output with the skill._

##### Observed differences

- _List the differences that you see between the two versions._
