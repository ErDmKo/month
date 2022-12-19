{
  description = "Package description";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachSystem ["x86_64-linux"] (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        rustVersion = (pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml);
        rustPlatform = pkgs.makeRustPlatform {
          cargo = rustVersion;
          rustc = rustVersion;
        };

        appName = "whatAmonth";

        appRustBuild = rustPlatform.buildRustPackage {
          pname = appName;
          version = "0.1.0";
          src = ./.;
          cargoLock.lockFile = ./Cargo.lock;
        };

        dockerImage = pkgs.dockerTools.buildImage {
          name = appName;
          config = { Entrypoint = [ "${appRustBuild}/bin/${appName}" ]; };
        };
      in
        { 
          packages = {
            rustPackage = appRustBuild;
            docker = dockerImage;
          };
          defaultPackage = dockerImage;
          devShell = pkgs.mkShell {
            buildInputs =
              [ (rustVersion.override { extensions = [ "rust-src" ]; }) ];
          };
        });
}
