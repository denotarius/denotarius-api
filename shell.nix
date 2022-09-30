{}:
let
  # Pin the deployment package-set to a specific version of nixpkgs
  pkgs = import
    (builtins.fetchTarball {
      url = "https://github.com/NixOS/nixpkgs/archive/46251a79f752ae1d46ef733e8e9760b6d3429da4.tar.gz";
      sha256 = "1xsp0xyrf8arjkf4wi09n96kbg0r8igsmzx8bhc1nj4nr078p0pg";
    })
    { };

in
with pkgs;
stdenv.mkDerivation {
  name = "denotarius-api";
  buildInputs = [
    nodejs-16_x
    (yarn.override { nodejs = nodejs-16_x; })
  ];
  shellHook = ''
    export PATH="$PATH:$(pwd)/node_modules/.bin"
    yarn
  '';
}