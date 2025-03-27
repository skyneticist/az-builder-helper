# Azure Builder Helper

**Azure Builder Helper** is a CLI tool designed to scaffold new [Pulumi](https://www.pulumi.com/) projects. It automatically creates a project directory, populates it with starter files, copies over example resources, and installs dependencies. This tool helps engineers quickly spin up consistent Pulumi projects in a matter of seconds.

---

## Table of Contents

- [Azure Builder Helper](#azure-builder-helper)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Examples](#examples)
  - [Next Steps](#next-steps)

---

## Features

- **Simple CLI**: Run `azbuilder new <projectName>` to create a new Pulumi project.  
- **Template-Based**: Scaffolds `index.ts`, `Pulumi.yaml`, and other config files with placeholders.  
- **Example Resources**: Optionally copies over an `examples` directory with helpful code samples.  
- **Package.json Generation**: Automatically creates a `package.json` file with a default dependency.  

---

## Prerequisites

- **Node.js** (version 14 or higher recommended)  
- **npm** (version 6 or higher recommended)  
- **Pulumi CLI** (if you plan to manage and deploy Pulumi stacks)

---

## Installation

1. **Clone the Repository** (or download the source code):

   ```bash
   git clone https://github.com/your-org/azure-builder-helper.git
   cd azure-builder-helper
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Build**:

   ```bash
   npm run build
   ```

4. **Link the CLI** (optional, for local development):

   ```bash
   npm link
   ```

After this, the commands `azbuilder` and `pulumime` should be available globally on your system (if you ran `npm link`). If you prefer not to link, you can also run the CLI directly via `node dist/bin/azbuilder.js`.

---

## Usage

To create a new Pulumi project, simply run:

```bash
azbuilder new <projectName>
```

For example:

```bash
azbuilder new MyPulumiProject
```

This will:

1. Create a new directory named `MyPulumiProject`.  
2. Copy and render template files (e.g., `index.ts`, `Pulumi.yaml`) using your chosen project name.  
3. Copy an `examples` folder with sample resources, if present.  
4. Generate a default `package.json` (if none exists) and install dependencies.  
5. Create a `.gitignore` file.  

You can also invoke the CLI via its **easter egg**:

```bash
pulumime new MyPulumiProject
```

Both commands have the same functionality.

---

## Examples

- **Basic Example**  
  ```bash
  azbuilder new MyPulumiProject
  ```
  This creates a new directory `MyPulumiProject` containing starter Pulumi files, an examples folder, and a `.gitignore`.

- **Project Directory Already Exists**  
  If the directory already exists, you’ll see an error message. In that case, choose a different name or remove the existing directory.

---

## Next Steps

After the CLI finishes creating your project, you’ll see something like:

```
Project setup complete!

Next steps:
1. cd MyPulumiProject
2. Create any new necessary Pulumi stacks using the pulumi CLI (e.g., pulumi stack init <stack-name>).
3. Enjoy building your Pulumi project!
```

1. **Change Directory**:  
   ```bash
   cd MyPulumiProject
   ```

2. **Initialize a Pulumi Stack** (if you haven’t already):  
   ```bash
   pulumi stack init dev
   ```

3. **Deploy**:  
   ```bash
   pulumi up
   ```
   This previews and applies your infrastructure changes.
