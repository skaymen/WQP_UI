param([String]$arg1="--update")

Write-Output "You must have node, Python 3.x, and virtualenv installed and available via the system path."

$configExists = Test-Path instance\config.py
if (-Not $configExists) {
	Write-Output "Please create an instance\config.py file before proceeding. See the README.md for what's required."
	Exit
}

if ($arg1 -eq "--clean") {
	Write-Output "Clearing old dependencies."
	Remove-Item env -Force -Recurse
	Remove-Item node_modules -Force -Recurse
	Remove-Item wqp\bower_components -Force -Recurse

}

Write-Output "Installing npm dependencies"
npm install

$envExists = Test-Path env
if (-Not $envExists) {
	Write-Output "Creating a virtualenv."
	virtualenv env --python=python3 --no-download
}
else {
	Write-Output "Virtualenv already exists."
}
Write-Output "Installing python requirements."
env\Scripts\pip install -r requirements.txt

Write-Output "Running Javascript tests."
node node_modules\karma\bin\karma start test\js\karma.conf.js

Write-Output "Running Python tests"
env\Scripts\python -m unittest

Write-Output "Finished setting up WQP-UI."