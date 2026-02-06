{
  "description": "A Nix-based development environment for a Next.js project.",
  "inputs": {
    "nixpkgs": {
      "url": "github:NixOS/nixpkgs/nixos-unstable"
    }
  },
  "outputs": {
    "self": _,
    "nixpkgs": { ... }:
      let
        system = "x86_64-linux";
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.${system}.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs-20_x
            openssh
          ];
        };
      }
  }
}
