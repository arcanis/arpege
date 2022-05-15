file = math*

math = name " " expression "\n"

name = @token(type: "function") [a-z]+
expression = "{" (@token(type: "language:math") [^}]+) "}"
