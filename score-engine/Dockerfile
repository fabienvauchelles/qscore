FROM continuumio/miniconda3:4.5.11

# Change timezone
RUN echo "Europe/Paris" > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata

# Install pip and conda packages and their dependencies
RUN apt-get update \
    && apt-get install --yes --no-install-recommends gcc g++ libgomp1 \
    && pip install --upgrade --no-cache-dir pip \
    && rm -rf /var/lib/apt/lists/*

# use requirements.txt and conda-requirements.txt to fix the package versions
COPY requirements.txt requirements.txt
COPY conda-requirements.txt conda-requirements.txt

# Install pip and conda packages and their dependencies
RUN conda install --quiet --yes --file conda-requirements.txt \
    && pip install --quiet -r requirements.txt --no-cache-dir \
    && conda clean --yes --all

# Ensure that Python outputs everything that's printed inside
# the application rather than buffering it.
ENV PYTHONUNBUFFERED 1

# Add the project to the python path to run tests and benchmark
ENV PYTHONPATH .

# Add source
COPY src .

# Force the use of `/etc/gunicorn/config.py`, but then allow
# the server to be executed to be controlled by the outside world.
EXPOSE 5000
ENTRYPOINT ["python"]
CMD ["main.py"]
